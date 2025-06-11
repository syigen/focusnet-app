import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Target, Calendar, Clock, Tag, Plus, Trash2, Save, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { loadCategories, saveTimeBlocks, loadTimeBlocks, BlockCategory } from '@/utils/storage';
import { TimeBlockData } from '@/components/TimeBlock';
import MobileHeader from '@/components/MobileHeader';

export default function CreateBlockScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today's date
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedDuration, setSelectedDuration] = useState(60); // in minutes
  const [selectedCategory, setSelectedCategory] = useState<BlockCategory | null>(null);
  const [customColor, setCustomColor] = useState('#FF6B35');
  const [tasks, setTasks] = useState<string[]>(['']);
  const [categories, setCategories] = useState<BlockCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Modal dropdown states
  const [activeDropdown, setActiveDropdown] = useState<'hour' | 'minute' | 'period' | 'duration' | 'date' | null>(null);

  const predefinedColors = [
    '#FF6B35', '#2E8B8B', '#8B4F9F', '#4F8B3B', 
    '#B85C38', '#6B4E7D', '#7D6B4E', '#FF4444',
    '#FFB800', '#4CAF50', '#2196F3', '#9C27B0'
  ];

  const durationOptions = [
    { value: 15, label: '15m' },
    { value: 30, label: '30m' },
    { value: 45, label: '45m' },
    { value: 60, label: '1h' },
    { value: 90, label: '1h 30m' },
    { value: 120, label: '2h' },
    { value: 180, label: '3h' },
    { value: 240, label: '4h' }
  ];

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const periods = ['AM', 'PM'];

  useEffect(() => {
    loadCategoriesData();
  }, []);

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    // Add past 3 days, today, and next 14 days
    for (let i = -3; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const label = formatDate(dateString);
      dates.push({ value: dateString, label });
    }
    
    return dates;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Reset time for comparison
    const blockDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (blockDate.getTime() === todayDate.getTime()) {
      return 'Today';
    } else if (blockDate.getTime() === tomorrowDate.getTime()) {
      return 'Tomorrow';
    } else if (blockDate.getTime() === yesterdayDate.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTimeTo24Hour = (hour: number, minute: number, period: 'AM' | 'PM') => {
    let hour24 = hour;
    if (period === 'AM' && hour === 12) hour24 = 0;
    if (period === 'PM' && hour !== 12) hour24 = hour + 12;
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatTime12Hour = (hour: number, minute: number, period: 'AM' | 'PM') => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const calculateEndTime = () => {
    const startTime24 = formatTimeTo24Hour(startHour, startMinute, startPeriod);
    const start = new Date(`2000-01-01 ${startTime24}`);
    const end = new Date(start.getTime() + selectedDuration * 60000);
    
    const endHour = end.getHours();
    const endMinute = end.getMinutes();
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const displayEndHour = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
    
    return formatTime12Hour(displayEndHour, endMinute, endPeriod);
  };

  const loadCategoriesData = async () => {
    try {
      const savedCategories = await loadCategories();
      setCategories(savedCategories);
      if (!selectedCategory && savedCategories.length > 0) {
        setSelectedCategory(savedCategories[0]);
        setCustomColor(savedCategories[0].color);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddTask = () => {
    if (tasks.length < 5) {
      setTasks([...tasks, '']);
    }
  };

  const handleRemoveTask = (index: number) => {
    if (tasks.length > 1) {
      const newTasks = tasks.filter((_, i) => i !== index);
      setTasks(newTasks);
    }
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }

    if (selectedDuration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setTitle('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setStartHour(9);
    setStartMinute(0);
    setStartPeriod('AM');
    setSelectedDuration(60);
    setTasks(['']);
    setErrors({});
    // Keep selected category and color for convenience
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const filteredTasks = tasks.filter(task => task.trim() !== '');
      const startTime = formatTimeTo24Hour(startHour, startMinute, startPeriod);
      
      // Calculate end time based on duration
      const start = new Date(`2000-01-01 ${startTime}`);
      const end = new Date(start.getTime() + selectedDuration * 60000);
      const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
      
      const blockData: TimeBlockData = {
        id: Date.now().toString(),
        title: title.trim(),
        date: selectedDate,
        startTime,
        endTime,
        category: selectedCategory!.name,
        color: customColor,
        tasks: filteredTasks,
        isActive: false,
        isCompleted: false,
        progress: 0,
      };

      // Load existing blocks and add new one
      const existingBlocks = await loadTimeBlocks();
      const updatedBlocks = [...existingBlocks, blockData];
      await saveTimeBlocks(updatedBlocks);
      
      // Clear form after successful save
      clearForm();
      
      // Navigate back immediately
      router.back();
      
    } catch (error) {
      console.error('Error saving time block:', error);
      Alert.alert('Error', 'Failed to save time block. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    clearForm();
    router.back();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  };

  const renderDropdownModal = () => {
    if (!activeDropdown) return null;

    let options: any[] = [];
    let selectedValue: any = null;
    let onSelect: (value: any) => void = () => {};
    let title = '';

    switch (activeDropdown) {
      case 'date':
        options = generateDateOptions();
        selectedValue = selectedDate;
        onSelect = setSelectedDate;
        title = 'Select Date';
        break;
      case 'hour':
        options = hours;
        selectedValue = startHour;
        onSelect = setStartHour;
        title = 'Select Hour';
        break;
      case 'minute':
        options = minutes;
        selectedValue = startMinute;
        onSelect = setStartMinute;
        title = 'Select Minute';
        break;
      case 'period':
        options = periods;
        selectedValue = startPeriod;
        onSelect = setStartPeriod;
        title = 'Select Period';
        break;
      case 'duration':
        options = durationOptions;
        selectedValue = selectedDuration;
        onSelect = setSelectedDuration;
        title = 'Select Duration';
        break;
    }

    return (
      <Modal
        visible={true}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
        >
          <View style={[styles.dropdownModal, { maxWidth: screenWidth * 0.9 }]}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                <Text style={styles.dropdownClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
              {options.map((option, index) => {
                const value = typeof option === 'object' ? option.value : option;
                const label = typeof option === 'object' ? option.label : 
                  (activeDropdown === 'minute' || activeDropdown === 'hour') ? 
                    option.toString().padStart(2, '0') : option.toString();
                const isSelected = selectedValue === value;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                    onPress={() => {
                      onSelect(value);
                      setActiveDropdown(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownOptionText,
                      isSelected && styles.dropdownOptionTextSelected
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: Math.max(20, screenWidth * 0.05),
      paddingLeft: Math.max(insets.left + 20, screenWidth * 0.05),
      paddingRight: Math.max(insets.right + 20, screenWidth * 0.05),
      paddingBottom: Math.max(insets.bottom + 32, 32),
    },
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 12,
    },
    sectionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionContent: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    sectionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    titleInput: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 20,
      fontSize: 18,
      color: colors.text,
      fontWeight: '600',
      minHeight: 56,
    },
    titleInputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      marginTop: 8,
      marginLeft: 4,
      fontWeight: '500',
    },
    dateContainer: {
      gap: 20,
    },
    dateDropdownContainer: {
      marginBottom: 20,
    },
    dateDropdownButton: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 56,
    },
    dateDropdownButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    dateDropdownValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    tasksContainer: {
      gap: 16,
    },
    taskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    taskInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
      minHeight: 48,
    },
    taskButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeTaskButton: {
      backgroundColor: colors.error + '30',
      borderWidth: 2,
      borderColor: colors.error + '60',
    },
    addTaskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 16,
      gap: 10,
      backgroundColor: colors.surface,
      minHeight: 56,
    },
    addTaskText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    durationContainer: {
      gap: 20,
    },
    timeRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    timeDropdownContainer: {
      flex: 1,
    },
    timeDropdownButton: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 56,
    },
    timeDropdownButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    timeDropdownLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 8,
    },
    timeDropdownValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    durationDropdownContainer: {
      marginBottom: 20,
    },
    durationDropdownButton: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 56,
    },
    durationDropdownButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    durationDropdownValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    endTimeDisplay: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      alignSelf: 'center',
    },
    endTimeLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: 'white',
      marginBottom: 4,
      letterSpacing: 1,
    },
    endTimeText: {
      fontSize: 18,
      fontWeight: '800',
      color: 'white',
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: 10,
      minWidth: 120,
      minHeight: 48,
    },
    categoryChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    categoryDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    categoryTextSelected: {
      color: colors.primary,
      fontWeight: '700',
    },
    colorsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginTop: 16,
    },
    colorOption: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 3,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    colorOptionSelected: {
      borderColor: colors.text,
      transform: [{ scale: 1.15 }],
    },
    colorPreview: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    footer: {
      flexDirection: 'row',
      padding: 20,
      paddingLeft: Math.max(insets.left + 20, 20),
      paddingRight: Math.max(insets.right + 20, 20),
      paddingBottom: Math.max(insets.bottom + 20, 20),
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 16,
      backgroundColor: colors.surface,
    },
    footerButton: {
      flex: 1,
      paddingVertical: 20,
      borderRadius: 20,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      minHeight: 56,
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    saveButtonDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.6,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
    },
    cancelButtonText: {
      color: colors.textSecondary,
    },
    saveButtonText: {
      color: 'white',
    },
    // Modal dropdown styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    dropdownModal: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      width: '100%',
      maxHeight: '60%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    dropdownHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    dropdownClose: {
      fontSize: 20,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    dropdownList: {
      maxHeight: 300,
    },
    dropdownOption: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '30',
      minHeight: 48,
      justifyContent: 'center',
    },
    dropdownOptionSelected: {
      backgroundColor: colors.primary + '20',
    },
    dropdownOptionText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    dropdownOptionTextSelected: {
      color: colors.primary,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <MobileHeader
        title="Create Time Block"
        subtitle="Plan your focused work session"
        leftComponent={
          <TouchableOpacity onPress={handleCancel}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 1. Title Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '30' }]}>
                <Target size={18} color={colors.primary} />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Block Title</Text>
                <Text style={styles.sectionDescription}>What will you focus on?</Text>
              </View>
            </View>
            <TextInput
              style={[
                styles.titleInput,
                errors.title && styles.titleInputError
              ]}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) {
                  const newErrors = { ...errors };
                  delete newErrors.title;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter a descriptive title..."
              placeholderTextColor={colors.textSecondary}
              maxLength={50}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* 2. Date Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '30' }]}>
                <Calendar size={18} color={colors.primary} />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Date</Text>
                <Text style={styles.sectionDescription}>When will this happen?</Text>
              </View>
            </View>
            
            <View style={styles.dateContainer}>
              {/* Date Selection */}
              <View style={styles.dateDropdownContainer}>
                <TouchableOpacity 
                  style={[
                    styles.dateDropdownButton,
                    activeDropdown === 'date' && styles.dateDropdownButtonActive
                  ]}
                  onPress={() => setActiveDropdown('date')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateDropdownValue}>
                    {formatDate(selectedDate)}
                  </Text>
                  <ChevronDown size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 3. Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '30' }]}>
                <Calendar size={18} color={colors.primary} />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Tasks</Text>
                <Text style={styles.sectionDescription}>What specific tasks will you complete?</Text>
              </View>
            </View>
            <View style={styles.tasksContainer}>
              {tasks.map((task, index) => (
                <View key={index} style={styles.taskRow}>
                  <TextInput
                    style={styles.taskInput}
                    value={task}
                    onChangeText={(value) => handleTaskChange(index, value)}
                    placeholder={`Task ${index + 1}...`}
                    placeholderTextColor={colors.textSecondary}
                    maxLength={100}
                  />
                  {tasks.length > 1 && (
                    <TouchableOpacity
                      style={[styles.taskButton, styles.removeTaskButton]}
                      onPress={() => handleRemoveTask(index)}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {tasks.length < 5 && (
                <TouchableOpacity style={styles.addTaskRow} onPress={handleAddTask}>
                  <Plus size={16} color={colors.textSecondary} />
                  <Text style={styles.addTaskText}>Add another task</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 4. Duration Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '30' }]}>
                <Clock size={18} color={colors.primary} />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Time & Duration</Text>
                <Text style={styles.sectionDescription}>When will this happen?</Text>
              </View>
            </View>
            
            <View style={styles.durationContainer}>
              {/* Start Time Selection */}
              <View style={styles.timeRow}>
                {/* Hour Dropdown */}
                <View style={styles.timeDropdownContainer}>
                  <Text style={styles.timeDropdownLabel}>Hour</Text>
                  <TouchableOpacity 
                    style={[
                      styles.timeDropdownButton,
                      activeDropdown === 'hour' && styles.timeDropdownButtonActive
                    ]}
                    onPress={() => setActiveDropdown('hour')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeDropdownValue}>
                      {startHour.toString().padStart(2, '0')}
                    </Text>
                    <ChevronDown size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Minute Dropdown */}
                <View style={styles.timeDropdownContainer}>
                  <Text style={styles.timeDropdownLabel}>Minute</Text>
                  <TouchableOpacity 
                    style={[
                      styles.timeDropdownButton,
                      activeDropdown === 'minute' && styles.timeDropdownButtonActive
                    ]}
                    onPress={() => setActiveDropdown('minute')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeDropdownValue}>
                      {startMinute.toString().padStart(2, '0')}
                    </Text>
                    <ChevronDown size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Period Dropdown */}
                <View style={styles.timeDropdownContainer}>
                  <Text style={styles.timeDropdownLabel}>Period</Text>
                  <TouchableOpacity 
                    style={[
                      styles.timeDropdownButton,
                      activeDropdown === 'period' && styles.timeDropdownButtonActive
                    ]}
                    onPress={() => setActiveDropdown('period')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeDropdownValue}>{startPeriod}</Text>
                    <ChevronDown size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Duration Dropdown */}
              <View style={styles.durationDropdownContainer}>
                <Text style={styles.timeDropdownLabel}>Duration</Text>
                <TouchableOpacity 
                  style={[
                    styles.durationDropdownButton,
                    activeDropdown === 'duration' && styles.durationDropdownButtonActive
                  ]}
                  onPress={() => setActiveDropdown('duration')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.durationDropdownValue}>
                    {durationOptions.find(d => d.value === selectedDuration)?.label || formatDuration(selectedDuration)}
                  </Text>
                  <ChevronDown size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {/* End Time Display */}
              <View style={styles.endTimeDisplay}>
                <Text style={styles.endTimeLabel}>ENDS AT</Text>
                <Text style={styles.endTimeText}>{calculateEndTime()}</Text>
              </View>
              
              {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
            </View>
          </View>

          {/* 5. Category Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '30' }]}>
                <Tag size={18} color={colors.primary} />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Category</Text>
                <Text style={styles.sectionDescription}>What type of work is this?</Text>
              </View>
            </View>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory?.id === category.id && styles.categoryChipSelected,
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    setCustomColor(category.color);
                    if (errors.category) {
                      const newErrors = { ...errors };
                      delete newErrors.category;
                      setErrors(newErrors);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.categoryDot, { backgroundColor: category.color }]}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory?.id === category.id && styles.categoryTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          {/* 6. Color Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '30' }]}>
                <Target size={18} color={colors.primary} />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Custom Color</Text>
                <Text style={styles.sectionDescription}>Choose a color for this block</Text>
              </View>
            </View>
            <View style={styles.colorsGrid}>
              {predefinedColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    customColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setCustomColor(color)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.colorPreview, { backgroundColor: color }]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.cancelButton]}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.footerButton,
            styles.saveButton,
            isLoading && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <Text style={[styles.buttonText, styles.saveButtonText]}>Saving...</Text>
          ) : (
            <>
              <Save size={16} color="white" />
              <Text style={[styles.buttonText, styles.saveButtonText]}>Create Block</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      {renderDropdownModal()}
    </View>
  );
}