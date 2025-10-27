import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
    ScrollView,
    TextInput,
    Image,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { uploadVideo } from '../../Services/VideoService';
import { useDispatch } from 'react-redux';
import { clearVideos, addVideo } from '../../store/videoSlice';
import { getVideoUrl } from '../../Utils/ImageUrlHelper';

const { width, height } = Dimensions.get('window');

interface VideoData {
    uri: string;
    fileName?: string;
    duration?: number;
    width?: number;
    height?: number;
}

export default function Upload() {
    const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
    const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const videoRef = useRef<Video>(null);
    const dispatch = useDispatch();

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant permission to access your media library.');
            return false;
        }
        return true;
    };

    const pickVideo = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 1,
                videoMaxDuration: 60, // 60 seconds max
            });

            if (!result.canceled && result.assets[0]) {
                const video = result.assets[0];
                setSelectedVideo({
                    uri: video.uri,
                    fileName: video.fileName || `video_${Date.now()}.mp4`,
                    duration: video.duration || undefined,
                    width: video.width || undefined,
                    height: video.height || undefined,
                });
            }
        } catch (error) {
            console.error('Error picking video:', error);
            Alert.alert('Error', 'Failed to pick video. Please try again.');
        }
    };

    const pickThumbnail = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9], // Video aspect ratio
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedThumbnail(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking thumbnail:', error);
            Alert.alert('Error', 'Failed to pick thumbnail. Please try again.');
        }
    };

    const removeVideo = () => {
        setSelectedVideo(null);
        setSelectedThumbnail(null);
        setTitle('');
        setDescription('');
    };

    const handleUpload = async () => {
        if (!selectedVideo) {
            Alert.alert('No Video', 'Please select a video to upload.');
            return;
        }

        if (!title.trim()) {
            Alert.alert('Title Required', 'Please enter a title for your video.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', {
                uri: selectedVideo.uri,
                type: 'video/mp4',
                name: selectedVideo.fileName,
            } as any);
            formData.append('title', title.trim());
            if (description.trim()) {
                formData.append('description', description.trim());
            }
            if (selectedThumbnail) {
                console.log('📸 Adding thumbnail to FormData:', selectedThumbnail);
                formData.append('thumbnail', {
                    uri: selectedThumbnail,
                    type: 'image/jpeg',
                    name: `thumbnail_${Date.now()}.jpg`,
                } as any);
            } else {
                console.warn('⚠️ No thumbnail selected!');
            }
            
            console.log('📤 Uploading with FormData:', {
                hasFile: true,
                title: title.trim(),
                hasDescription: !!description.trim(),
                hasThumbnail: !!selectedThumbnail
            });

            const response = await uploadVideo(formData, (progressEvent: any) => {
                const total = progressEvent.total || progressEvent.loaded || 1;
                const progress = Math.min(100, Math.round((progressEvent.loaded * 100) / total));
                setUploadProgress(progress);
            });

            // Add new video to store immediately
            if (response.code === 1000 && response.result) {
                const newVideo = {
                    id: response.result.id,
                    uri: getVideoUrl(response.result.url || response.result.secureUrl || ''),
                    title: response.result.title || response.result.fileName || 'Untitled Video',
                    description: response.result.description || '',
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    outstanding: 0,
                    thumbnailUrl: response.result.thumbnailUrl
                };
                dispatch(addVideo(newVideo));
                console.log('New video added to store:', newVideo);
            }

            Alert.alert('Success', 'Video uploaded successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        removeVideo();
                        setIsUploading(false);
                        setUploadProgress(0);
                    }
                }
            ]);
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', 'Failed to upload video. Please try again.');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const renderVideoPreview = () => {
        if (!selectedVideo) return null;

        return (
            <View style={styles.videoPreviewContainer}>
                <Video
                    ref={videoRef}
                    source={{ uri: selectedVideo.uri }}
                    style={styles.videoPreview}
                    useNativeControls
                    resizeMode={ResizeMode.COVER}
                    isLooping
                />
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={removeVideo}
                >
                    <Ionicons name="close-circle" size={30} color="#ff4444" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderUploadForm = () => {
        if (!selectedVideo) return null;

        return (
            <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Video Details</Text>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Title *</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter video title..."
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />
                    <Text style={styles.charCount}>{title.length}/100</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                        style={[styles.textInput, styles.descriptionInput]}
                        placeholder="Describe your video..."
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>{description.length}/500</Text>
                </View>

                {/* Thumbnail Selection */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Thumbnail (Optional)</Text>
                    <View style={styles.thumbnailContainer}>
                        {selectedThumbnail ? (
                            <View style={styles.thumbnailPreview}>
                                <Image source={{ uri: selectedThumbnail }} style={styles.thumbnailImage} />
                                <TouchableOpacity 
                                    style={styles.removeThumbnailButton}
                                    onPress={() => setSelectedThumbnail(null)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.thumbnailButton}
                                onPress={pickThumbnail}
                            >
                                <Ionicons name="image-outline" size={32} color="#666" />
                                <Text style={styles.thumbnailButtonText}>Select Thumbnail</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.uploadButton,
                        (!title.trim() || isUploading) && styles.uploadButtonDisabled
                    ]}
                    onPress={handleUpload}
                    disabled={!title.trim() || isUploading}
                >
                    {isUploading ? (
                        <View style={styles.uploadingContainer}>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.uploadButtonText}>Uploading... {uploadProgress}%</Text>
                        </View>
                    ) : (
                        <Text style={styles.uploadButtonText}>Upload Video</Text>
                    )}
                </TouchableOpacity>

                {isUploading && (
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${uploadProgress}%` }
                                ]} 
                            />
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Video</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {!selectedVideo ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="videocam-outline" size={80} color="#666" />
                        </View>
                        <Text style={styles.emptyTitle}>No Video Selected</Text>
                        <Text style={styles.emptySubtitle}>
                            Choose a video from your gallery to get started
                        </Text>
                        
                        <TouchableOpacity style={styles.selectButton} onPress={pickVideo}>
                            <Ionicons name="folder-open-outline" size={24} color="#fff" />
                            <Text style={styles.selectButtonText}>Select Video</Text>
                        </TouchableOpacity>

                        <View style={styles.requirementsContainer}>
                            <Text style={styles.requirementsTitle}>Video Requirements:</Text>
                            <Text style={styles.requirementItem}>• Maximum duration: 60 seconds</Text>
                            <Text style={styles.requirementItem}>• Supported formats: MP4, MOV</Text>
                            <Text style={styles.requirementItem}>• Maximum file size: 100MB</Text>
                        </View>
                    </View>
                ) : (
                    <>
                        {renderVideoPreview()}
                        {renderUploadForm()}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        fontFamily: 'TikTokSans-SemiBold',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
        fontFamily: 'TikTokSans-SemiBold',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
        fontFamily: 'TikTokSans-Regular',
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FE2C55',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 25,
        marginBottom: 40,
    },
    selectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        fontFamily: 'TikTokSans-SemiBold',
    },
    requirementsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 20,
        borderRadius: 12,
        width: '100%',
    },
    requirementsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
        fontFamily: 'TikTokSans-SemiBold',
    },
    requirementItem: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 6,
        fontFamily: 'TikTokSans-Regular',
    },
    videoPreviewContainer: {
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#111',
        position: 'relative',
    },
    videoPreview: {
        width: '100%',
        height: height * 0.4,
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
    },
    formContainer: {
        padding: 16,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 20,
        fontFamily: 'TikTokSans-SemiBold',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        marginBottom: 8,
        fontFamily: 'TikTokSans-Medium',
    },
    textInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#fff',
        fontFamily: 'TikTokSans-Regular',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
        fontFamily: 'TikTokSans-Regular',
    },
    uploadButton: {
        backgroundColor: '#FE2C55',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    uploadButtonDisabled: {
        backgroundColor: 'rgba(254, 44, 85, 0.5)',
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'TikTokSans-SemiBold',
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnailContainer: {
        marginTop: 8,
    },
    thumbnailButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderStyle: 'dashed',
    },
    thumbnailButtonText: {
        color: '#999',
        fontSize: 14,
        marginTop: 8,
        fontFamily: 'TikTokSans-Regular',
    },
    thumbnailPreview: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    thumbnailImage: {
        width: '100%',
        height: 120,
        borderRadius: 12,
    },
    removeThumbnailButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 12,
    },
    progressBarContainer: {
        marginTop: 16,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FE2C55',
        borderRadius: 2,
    },
});