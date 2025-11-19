import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome6,
} from '@expo/vector-icons';
import ReportModal from './ReportModal';
import ReportTicketService from '../../Services/ReportTicketService';
import { FeedItemType, ReportCategory } from '../../Types/request/ReportTicketRequest';

interface VideoOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  feedItemId: string; // FeedItem ID
  videoId?: string; // Video ID (optional, for targetId)
  onDownload?: () => void;
  onNotInterested?: () => void;
  onReport?: () => void;
  onSpeedChange?: (speed: number) => void;
  onSimplifiedScreen?: () => void;
  onSubtitles?: () => void;
  onPictureInPicture?: () => void;
}

// Map report reason text to ReportCategory (mapping với backend enum)
// Chỉ dùng các category Content-related, không dùng Behavioral/Account issues (dành cho báo cáo user)
const mapReasonToCategory = (reason: string): ReportCategory => {
  const reasonMap: Record<string, ReportCategory> = {
    // Content-related
    'Hình ảnh khỏa thân hoặc nội dung tình dục': ReportCategory.NUDITY,
    'Bạo lực, lạm dụng và bóc lột để phạm tội': ReportCategory.VIOLENCE,
    'Thù ghét và quấy rối': ReportCategory.HATE_SPEECH,
    'Tự tử và tự làm hại bản thân': ReportCategory.SELF_HARM_OR_SUICIDE,
    'Nội dung gây sốc và phản cảm': ReportCategory.GRAPHIC_CONTENT,
    'Cách ăn uống không lành mạnh và hình ảnh cơ thể ốm yếu': ReportCategory.GRAPHIC_CONTENT,
    'Hoạt động và thử thách nguy hiểm': ReportCategory.GRAPHIC_CONTENT,
    'Thông tin sai lệch': ReportCategory.MISINFORMATION,
    'Hành vi lừa đảo và gửi nội dung thư rác': ReportCategory.SPAM_OR_SCAM,
    'Tìm kiếm không phù hợp và không liên quan': ReportCategory.SPAM_OR_SCAM,
    'Gian lận và lừa đảo': ReportCategory.SPAM_OR_SCAM,
    'Hàng hóa và hoạt động được kiểm soát': ReportCategory.DRUGS_OR_WEAPONS,
  };
  return reasonMap[reason] || ReportCategory.OTHER;
};

const VideoOptionsModal: React.FC<VideoOptionsModalProps> = ({
  visible,
  onClose,
  feedItemId,
  videoId,
  onDownload,
  onNotInterested,
  onReport,
  onSpeedChange,
  onSimplifiedScreen,
  onSubtitles,
  onPictureInPicture,
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [backgroundAudio, setBackgroundAudio] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleReport = async (reason: string) => {
    try {
      setIsSubmittingReport(true);
      
      const reportCategory = mapReasonToCategory(reason);
      
      const requestData = {
        feedItemId: feedItemId, // ✅ Gửi feedItemId
        feedItemType: FeedItemType.VIDEO,
        targetId: videoId || feedItemId, // Fallback to feedItemId if videoId not provided
        reportCategory: reportCategory,
        violationContent: reason,
      };
      
      console.log('📤 Sending report request:', JSON.stringify(requestData, null, 2));
      
      const response = await ReportTicketService.createReportTicket(requestData);

      if (response.code === 1000) {
        Alert.alert(
          'Báo cáo đã được gửi',
          'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét và xử lý.',
          [{ text: 'OK', onPress: () => {
            onReport?.();
            onClose();
          }}]
        );
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể gửi báo cáo. Vui lòng thử lại.');
      }
    } catch (error: any) {
      // Lấy error message từ backend response
      const errorResponse = error.response?.data;
      const errorCode = errorResponse?.code;
      const errorMessage = errorResponse?.message 
        || error.message 
        || 'Không thể gửi báo cáo. Vui lòng thử lại.';
      
      // Chỉ log error nếu không phải business logic error (code 1116 = REPORT_LIMIT_EXCEEDED)
      if (errorCode !== 1116) {
        console.error('Error submitting report:', error);
      } else {
        console.log('ℹ️ Report limit exceeded - showing user message');
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    onSpeedChange?.(speed);
  };

  const OptionItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    rightComponent?: React.ReactNode;
  }> = ({ icon, label, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
      <View style={styles.optionLeft}>
        {icon}
        <Text style={styles.optionText}>{label}</Text>
      </View>
      {rightComponent && <View style={styles.optionRight}>{rightComponent}</View>}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.contentContainer}>
            {/* Drag handle */}
            <View style={styles.dragHandle} />

            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Actions Section */}
              <OptionItem
            icon={<Ionicons name="download-outline" size={24} color="#000" />}
            label="Tải về"
            onPress={() => {
              onDownload?.();
              onClose();
            }}
          />
          <OptionItem
            icon={<Ionicons name="heart-dislike-outline" size={24} color="#000" />}
            label="Không quan tâm"
            onPress={() => {
              onNotInterested?.();
              onClose();
            }}
          />
          <OptionItem
            icon={<Ionicons name="flag-outline" size={24} color="#000" />}
            label="Báo cáo"
            onPress={() => {
              setReportModalVisible(true);
            }}
          />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Speed Section */}
          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Ionicons name="time-outline" size={24} color="#000" />
              <Text style={styles.optionText}>Tốc độ</Text>
            </View>
            <View style={styles.speedSelector}>
              {[0.5, 1.0, 1.5, 2.0].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedButton,
                    playbackSpeed === speed && styles.speedButtonActive,
                  ]}
                  onPress={() => handleSpeedChange(speed)}
                >
                  <Text
                    style={[
                      styles.speedText,
                      playbackSpeed === speed && styles.speedTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Display and Audio Settings */}
          <OptionItem
            icon={<MaterialCommunityIcons name="view-compact-outline" size={24} color="#000" />}
            label="Màn hình giản lược"
            onPress={() => {
              onSimplifiedScreen?.();
              onClose();
            }}
          />
          <OptionItem
            icon={<Ionicons name="arrow-up-circle-outline" size={24} color="#000" />}
            label="Cuộn tự động"
            onPress={() => {}}
            rightComponent={
              <Switch
                value={autoScroll}
                onValueChange={setAutoScroll}
                trackColor={{ false: '#D1D1D1', true: '#34C759' }}
                thumbColor="#fff"
              />
            }
          />
          <OptionItem
            icon={<Ionicons name="text-outline" size={24} color="#000" />}
            label="Phụ đề và dịch thuật"
            onPress={() => {
              onSubtitles?.();
              onClose();
            }}
          />
          <OptionItem
            icon={<MaterialCommunityIcons name="picture-in-picture-bottom-right" size={24} color="#000" />}
            label="Ảnh trong ảnh"
            onPress={() => {
              onPictureInPicture?.();
              onClose();
            }}
          />
          <OptionItem
            icon={<Ionicons name="headset-outline" size={24} color="#000" />}
            label="Âm thanh nền"
            onPress={() => {}}
            rightComponent={
              <Switch
                value={backgroundAudio}
                onValueChange={setBackgroundAudio}
                trackColor={{ false: '#D1D1D1', true: '#34C759' }}
                thumbColor="#fff"
              />
            }
          />
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSelectReason={handleReport}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent để thấy video phía sau
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 12,
    height: '60%',
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 20,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D1D1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 20,
    fontWeight: '400',
  },
  optionRight: {
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 4,
  },
  speedSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speedButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedButtonActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  speedText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  speedTextActive: {
    color: '#000',
    fontWeight: '600',
  },
});

export default VideoOptionsModal;

