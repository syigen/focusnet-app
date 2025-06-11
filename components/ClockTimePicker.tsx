import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Clock, Check, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ClockTimePickerProps {
  value: string;
  onTimeChange: (time: string) => void;
  label: string;
}

export default function ClockTimePicker({ value, onTimeChange, label }: ClockTimePickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const { colors } = useTheme();

  const screenHeight = Dimensions.get('window').height;

  React.useEffect(() => {
    if (value) {
      const [time, period] = value.split(' ');
      const [hour, minute] = time.split(':').map(Number);
      setSelectedHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour);
      setSelectedMinute(minute);
      setSelectedPeriod(period as 'AM' | 'PM');
    }
  }, [value]);

  const formatTime = (hour: number, minute: number, period: 'AM' | 'PM') => {
    const displayHour = hour === 0 ? 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const handleConfirm = () => {
    const hour24 = selectedPeriod === 'AM' 
      ? (selectedHour === 12 ? 0 : selectedHour)
      : (selectedHour === 12 ? 12 : selectedHour + 12);
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onTimeChange(timeString);
    setIsVisible(false);
  };

  const displayValue = value ? (() => {
    const [hour, minute] = value.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  })() : 'Select Time';

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    timeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    timeButtonActive: {
      borderColor: colors.primary,
    },
    timeText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    placeholderText: {
      color: colors.textSecondary,
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxHeight: screenHeight * 0.8,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    clockContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    clockDisplay: {
      fontSize: 36,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 16,
    },
    pickersContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    pickerColumn: {
      flex: 1,
    },
    pickerLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    picker: {
      height: 120,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    pickerItem: {
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pickerItemSelected: {
      backgroundColor: colors.primary + '20',
    },
    pickerItemText: {
      fontSize: 18,
      color: colors.text,
    },
    pickerItemTextSelected: {
      color: colors.primary,
      fontWeight: '700',
    },
    periodContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    periodButtonSelected: {
      backgroundColor: colors.primary,
    },
    periodText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    periodTextSelected: {
      color: 'white',
    },
    confirmButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    confirmButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.timeButton, value && styles.timeButtonActive]}
        onPress={() => setIsVisible(true)}
      >
        <Clock size={20} color={value ? colors.primary : colors.textSecondary} />
        <Text style={[styles.timeText, !value && styles.placeholderText]}>
          {displayValue}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.clockContainer}>
              <Text style={styles.clockDisplay}>
                {formatTime(selectedHour, selectedMinute, selectedPeriod)}
              </Text>
            </View>

            <View style={styles.pickersContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedHour === hour && styles.pickerItemTextSelected,
                        ]}
                      >
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {minutes.filter(m => m % 5 === 0).map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.pickerItem,
                        selectedMinute === minute && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMinute === minute && styles.pickerItemTextSelected,
                        ]}
                      >
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Period</Text>
                <View style={styles.periodContainer}>
                  <TouchableOpacity
                    style={[
                      styles.periodButton,
                      selectedPeriod === 'AM' && styles.periodButtonSelected,
                    ]}
                    onPress={() => setSelectedPeriod('AM')}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        selectedPeriod === 'AM' && styles.periodTextSelected,
                      ]}
                    >
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.periodButton,
                      selectedPeriod === 'PM' && styles.periodButtonSelected,
                    ]}
                    onPress={() => setSelectedPeriod('PM')}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        selectedPeriod === 'PM' && styles.periodTextSelected,
                      ]}
                    >
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Check size={20} color="white" />
              <Text style={styles.confirmButtonText}>Confirm Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}