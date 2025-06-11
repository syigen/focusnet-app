import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import TimeBlock, { TimeBlockData } from '@/components/TimeBlock';
import MobileHeader from '@/components/MobileHeader';
import { loadTimeBlocks, saveTimeBlocks, filterBlocksByDate, getTodayDateString } from '@/utils/storage';
import { useTheme } from '@/contexts/ThemeContext';

export default function TodayScreen() {
  const [blocks, setBlocks] = useState<TimeBlockData[]>([]);
  const [allBlocks, setAllBlocks] = useState<TimeBlockData[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Update displayed blocks when date changes
  useEffect(() => {
    const filteredBlocks = filterBlocksByDate(allBlocks, selectedDate);
    setBlocks(filteredBlocks);
  }, [selectedDate, allBlocks]);

  const loadData = async () => {
    const savedBlocks = await loadTimeBlocks();
    setAllBlocks(savedBlocks);
    const filteredBlocks = filterBlocksByDate(savedBlocks, selectedDate);
    setBlocks(filteredBlocks);
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
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'next') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleBlockPress = (block: TimeBlockData) => {
    // Show block details in a nice alert format
    const formatTime12Hour = (time24: string) => {
      const [hour, minute] = time24.split(':').map(Number);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    };

    const tasksList = block.tasks.length > 0 
      ? '\n\nTasks:\n' + block.tasks.map(task => `• ${task}`).join('\n')
      : '\n\nNo tasks added yet.';

    const statusText = block.isCompleted 
      ? '✅ Completed' 
      : block.isActive 
        ? '🔄 Active' 
        : '⏳ Pending';

    Alert.alert(
      `📋 ${block.title}`,
      `📅 ${formatDate(block.date)}\n` +
      `⏰ ${formatTime12Hour(block.startTime)} - ${formatTime12Hour(block.endTime)}\n` +
      `🏷️ Category: ${block.category}\n` +
      `📊 Status: ${statusText}${tasksList}`,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Start Focus', 
          onPress: () => handleStartFocus(block),
          style: 'default'
        }
      ]
    );
  };

  const handleStartFocus = async (block: TimeBlockData) => {
    try {
      setActiveBlockId(block.id);
      
      // Update block as active and deactivate others
      const updatedBlocks = allBlocks.map(b => 
        b.id === block.id 
          ? { ...b, isActive: true }
          : { ...b, isActive: false }
      );
      
      setAllBlocks(updatedBlocks);
      await saveTimeBlocks(updatedBlocks);
      
      // Navigate to focus tab
      router.push('/(tabs)/focus');
    } catch (error) {
      console.error('Error starting focus:', error);
      Alert.alert('Error', 'Failed to start focus session. Please try again.');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const updatedBlocks = allBlocks.filter(block => block.id !== blockId);
      setAllBlocks(updatedBlocks);
      await saveTimeBlocks(updatedBlocks);
      Alert.alert('Success', 'Time block has been deleted!');
    } catch (error) {
      console.error('Error deleting block:', error);
      Alert.alert('Error', 'Failed to delete time block. Please try again.');
    }
  };

  const handleEditBlock = async (blockId: string, updatedData: Partial<TimeBlockData>) => {
    try {
      const updatedBlocks = allBlocks.map(block => 
        block.id === blockId 
          ? { ...block, ...updatedData }
          : block
      );
      setAllBlocks(updatedBlocks);
      await saveTimeBlocks(updatedBlocks);
      Alert.alert('Success', 'Time block has been updated!');
    } catch (error) {
      console.error('Error updating block:', error);
      Alert.alert('Error', 'Failed to update time block. Please try again.');
    }
  };

  const handleAddQuickBlock = () => {
    Alert.alert(
      'Add Quick Block',
      'Choose a quick block duration:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '30 min', onPress: () => createQuickBlock(30) },
        { text: '60 min', onPress: () => createQuickBlock(60) },
        { text: '90 min', onPress: () => createQuickBlock(90) },
      ]
    );
  };

  const createQuickBlock = async (duration: number) => {
    try {
      const now = new Date();
      const startTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const endDate = new Date(now.getTime() + duration * 60000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      const newBlock: TimeBlockData = {
        id: Date.now().toString(),
        title: `Quick Focus Block (${duration}min)`,
        date: selectedDate,
        startTime,
        endTime,
        category: 'Personal',
        color: '#FF6B35',
        tasks: ['Focus on current task'],
        isActive: false,
        isCompleted: false,
        progress: 0,
      };

      const updatedBlocks = [...allBlocks, newBlock];
      setAllBlocks(updatedBlocks);
      await saveTimeBlocks(updatedBlocks);
      
      Alert.alert('Success', `Quick ${duration}-minute block has been added!`);
    } catch (error) {
      console.error('Error creating quick block:', error);
      Alert.alert('Error', 'Failed to create quick block. Please try again.');
    }
  };

  const handleCopyYesterday = () => {
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    const yesterdayBlocks = filterBlocksByDate(allBlocks, yesterdayString);
    
    if (yesterdayBlocks.length === 0) {
      Alert.alert('No Blocks Found', 'There are no blocks from yesterday to copy.');
      return;
    }

    Alert.alert(
      'Copy Yesterday\'s Plan',
      `This will copy ${yesterdayBlocks.length} time blocks from yesterday to ${formatDate(selectedDate)}. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Copy', onPress: () => copyBlocks(yesterdayBlocks) },
      ]
    );
  };

  const copyBlocks = async (blocksToCopy: TimeBlockData[]) => {
    try {
      const copiedBlocks = blocksToCopy.map(block => ({
        ...block,
        id: `${Date.now()}-${Math.random()}`,
        date: selectedDate,
        isActive: false,
        isCompleted: false,
        progress: 0,
      }));

      const updatedBlocks = [...allBlocks, ...copiedBlocks];
      setAllBlocks(updatedBlocks);
      await saveTimeBlocks(updatedBlocks);
      
      Alert.alert('Success', `${copiedBlocks.length} blocks have been copied!`);
    } catch (error) {
      console.error('Error copying blocks:', error);
      Alert.alert('Error', 'Failed to copy blocks. Please try again.');
    }
  };

  const handleAddButtonPress = () => {
    router.push('/create-block');
  };

  const handleCreateCustomBlock = () => {
    router.push('/create-block');
  };

  const handleNotificationsPress = () => {
    Alert.alert('Notifications', `You have ${blocks.length} blocks scheduled for ${formatDate(selectedDate)}!`);
  };

  const getTodayStats = () => {
    const completed = blocks.filter(b => b.isCompleted).length;
    const total = blocks.length;
    const totalMinutes = blocks.reduce((acc, block) => {
      const start = new Date(`2000-01-01 ${block.startTime}`);
      const end = new Date(`2000-01-01 ${block.endTime}`);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);
    
    return { completed, total, totalMinutes };
  };

  const formatTime12Hour = (time24: string) => {
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const stats = getTodayStats();
  const currentHour = currentTime.getHours();

  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const isToday = selectedDate === getTodayDateString();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: Math.max(20, screenWidth * 0.05),
      paddingLeft: Math.max(insets.left + 20, screenWidth * 0.05),
      paddingRight: Math.max(insets.right + 20, screenWidth * 0.05),
      paddingTop: 16,
      paddingBottom: Math.max(insets.bottom + 32, 32),
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    dateNavigation: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      marginBottom: 8,
    },
    navButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateTitle: {
      fontSize: Math.min(20, screenWidth * 0.05),
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      flex: 1,
    },
    currentTimeContainer: {
      alignItems: 'center',
      paddingVertical: 16,
      marginBottom: 8,
    },
    currentTime: {
      fontSize: Math.min(24, screenWidth * 0.06),
      fontWeight: '600',
      color: colors.primary,
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsContainer: {
      flexDirection: screenWidth < 400 ? 'column' : 'row',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 80,
    },
    statNumber: {
      fontSize: Math.min(20, screenWidth * 0.05),
      fontWeight: '700',
      color: colors.text,
      marginTop: 8,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    blocksContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: Math.min(18, screenWidth * 0.045),
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 4,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    quickActions: {
      paddingBottom: 32,
      gap: 12,
    },
    quickActionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      minHeight: 48,
    },
    quickActionText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryAction: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.border,
      shadowColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
    },
    secondaryActionText: {
      color: colors.textSecondary,
    },
    createBlockButton: {
      backgroundColor: colors.secondary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      minHeight: 48,
    },
    createBlockText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    swipeHint: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    swipeHintText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 16,
    },
  });

  return (
    <View style={styles.container}>
      {/* Action Bar Header */}
      <MobileHeader
        title={isToday ? getGreeting() : formatDate(selectedDate)}
        subtitle={isToday ? formatDate(selectedDate) : `${blocks.length} blocks scheduled`}
        showNotifications={true}
        onNotificationsPress={handleNotificationsPress}
        rightComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddButtonPress}>
            <Plus size={20} color="white" />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Date Navigation */}
          <View style={styles.dateNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateDate('prev')}
            >
              <ChevronLeft size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateDate('next')}
            >
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Current Time - Only show for today */}
          {isToday && (
            <View style={styles.currentTimeContainer}>
              <Text style={styles.currentTime}>
                {formatTime12Hour(currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                }))}
              </Text>
            </View>
          )}

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.statNumber}>{stats.completed}/{stats.total}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={20} color={colors.secondary} />
              <Text style={styles.statNumber}>{Math.round(stats.totalMinutes / 60)}h</Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </View>
          </View>

          {/* Time Blocks */}
          <View style={styles.blocksContainer}>
            <Text style={styles.sectionTitle}>{formatDate(selectedDate)}'s Schedule</Text>
            
            {blocks.length > 0 && (
              <View style={styles.swipeHint}>
                <Text style={styles.swipeHintText}>
                  {isWeb 
                    ? '💡 Long press on any block to edit or delete it'
                    : '💡 Swipe left on any block to edit or delete it'
                  }
                </Text>
              </View>
            )}
            
            {blocks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No time blocks scheduled</Text>
                <Text style={styles.emptySubtext}>
                  {isToday 
                    ? 'Tap the + button to create your first block for today'
                    : `Create blocks for ${formatDate(selectedDate)} using the + button`
                  }
                </Text>
              </View>
            ) : (
              blocks.map((block) => (
                <TimeBlock
                  key={block.id}
                  block={block}
                  onPress={() => handleBlockPress(block)}
                  onStartFocus={() => handleStartFocus(block)}
                  onDelete={handleDeleteBlock}
                  onEdit={handleEditBlock}
                />
              ))
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.createBlockButton} onPress={handleCreateCustomBlock}>
              <Text style={styles.createBlockText}>Create New Block</Text>
            </TouchableOpacity>
            {isToday && (
              <TouchableOpacity style={styles.quickActionButton} onPress={handleAddQuickBlock}>
                <Text style={styles.quickActionText}>Add Quick Block</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.secondaryAction]}
              onPress={handleCopyYesterday}
            >
              <Text style={[styles.quickActionText, styles.secondaryActionText]}>
                Copy Yesterday's Plan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}