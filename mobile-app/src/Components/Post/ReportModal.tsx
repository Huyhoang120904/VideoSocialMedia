import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectReason?: (reason: string) => void;
}

const reportReasons = [
  'Tìm kiếm không phù hợp và không liên quan',
  'Bạo lực, lạm dụng và bóc lột để phạm tội',
  'Thù ghét và quấy rối',
  'Tự tử và tự làm hại bản thân',
  'Cách ăn uống không lành mạnh và hình ảnh cơ thể ốm yếu',
  'Hoạt động và thử thách nguy hiểm',
  'Hình ảnh khỏa thân hoặc nội dung tình dục',
  'Nội dung gây sốc và phản cảm',
  'Thông tin sai lệch',
  'Hành vi lừa đảo và gửi nội dung thư rác',
  'Hàng hóa và hoạt động được kiểm soát',
  'Gian lận và lừa đảo',
  // "Chia sẻ thông tin cá nhân" đã xóa vì không phù hợp với báo cáo video (dành cho báo cáo user)
];

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  onSelectReason,
}) => {
  const handleSelectReason = (reason: string) => {
    onSelectReason?.(reason);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Vui lòng chọn một lý do</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {reportReasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reasonItem}
                onPress={() => handleSelectReason(reason)}
              >
                <Text style={styles.reasonText}>{reason}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reasonText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
});

export default ReportModal;

