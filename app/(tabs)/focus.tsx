import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Coffee, Zap, CircleCheck as CheckCircle, Clock, TrendingUp, Target, Plus, Pause, Play } from 'lucide-react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FocusTimer from '@/components/FocusTimer';
import MobileHeader from '@/components/MobileHeader';
import { loadTimeBlocks, saveTimeBlocks, filterBlocksByDate, getTodayDateString } from '@/utils/storage';
import { TimeBlockData } from '@/components/TimeBlock';
import { useTheme } from '@/contexts/ThemeContext';

export default function FocusScreen() {
  const [activeBlock, setActiveBlock] = useState<TimeBlockData | null>(null);
  const [isInFocusMode, setIsInFocusMode] = useState(false);
  const [allBlocks, setAllBlocks] = useState<TimeBlockData[]>([]);
  const [todayBlocks, setTodayBlocks] = useState<TimeBlockData[]>([]);
  const [upcomingBlocks, setUpcomingBlocks] = useState<TimeBlockData[]>([]);
  const [completedBlocks, setCompletedBlocks] = useState<TimeBlockData[]>([]);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  // Update focus mode state in AsyncStorage
  const updateFocusMode = async (inFocus: boolean) => {
    try {
      await AsyncStorage.setItem('isInFocusMode', inFocus.toString());
      setIsInFocusMode(inFocus);
    } catch (error) {
      console.error('Error updating focus mode:', error);
    }
  };

  const loadData = async () => {
    try {
      const savedBlocks = await loadTimeBlocks();
      setAllBlocks(savedBlocks);
      
      const today = getTodayDateString();
      const todayFilteredBlocks = filterBlocksByDate(savedBlocks, today);
      setTodayBlocks(todayFilteredBlocks);
      
      // Find current active block
      const currentActive = savedBlocks.find(block => block.isActive);
      if (currentActive) {
        setActiveBlock(currentActive);
      }

      // Get upcoming blocks (not completed, not active, from today and future)
      const upcoming = savedBlocks.filter(block => {
        const blockDate = new Date(block.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        blockDate.setHours(0, 0, 0, 0);
        
        return !block.isCompleted && !block.isActive && blockDate >= today;
      }).slice(0, 5);
      setUpcomingBlocks(upcoming);

      // Get completed blocks for today
      const completed = todayFilteredBlocks.filter(block => block.isCompleted);
      setCompletedBlocks(completed);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const formatTime12Hour = (time24: string) => {
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
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

  const handleStartFocus = async (block: TimeBlockData) => {
    try {
      // Set this block as active and deactivate others
      const updatedBlocks = allBlocks.map(b => 
        b.id === block.id 
          ? { ...b, isActive: true }
          : { ...b, isActive: false }
      );
      
      setAllBlocks(updatedBlocks);
      setActiveBlock(block);
      await updateFocusMode(true); // Hide tab bar
      
      await saveTimeBlocks(updatedBlocks);
      
      // Reload data to update all states
      await loadData();
    } catch (error) {
      console.error('Error starting focus:', error);
      Alert.alert('Error', 'Failed to start focus session. Please try again.');
    }
  };

  const handleResumeFocus = async () => {
    if (activeBlock) {
      await updateFocusMode(true); // Hide tab bar
    }
  };

  const handleFocusComplete = async () => {
    if (activeBlock) {
      try {
        const updatedBlocks = allBlocks.map(b => 
          b.id === activeBlock.id 
            ? { ...b, isActive: false, isCompleted: true, progress: 100 }
            : b
        );
        
        setAllBlocks(updatedBlocks);
        await saveTimeBlocks(updatedBlocks);
        
        await updateFocusMode(false); // Show tab bar
        setActiveBlock(null);
        
        // Reload data to update all states
        await loadData();
        
        Alert.alert(
          '🎉 Focus Session Complete!',
          `Great job completing your "${activeBlock.title}" session!`,
          [{ text: 'Awesome!', onPress: () => {} }]
        );
      } catch (error) {
        console.error('Error completing focus:', error);
      }
    }
  };

  const handleStopFocus = async () => {
    if (activeBlock) {
      Alert.alert(
        'Pause Focus Session',
        'Do you want to pause this focus session? You can resume it later.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Pause', 
            onPress: async () => {
              try {
                // Keep the block as active but exit focus mode
                await updateFocusMode(false); // Show tab bar
                // Don't change the active block state - it remains active for resuming
              } catch (error) {
                console.error('Error pausing focus:', error);
              }
            }
          }
        ]
      );
    }
  };

  const handleEndFocus = async () => {
    if (activeBlock) {
      Alert.alert(
        'End Focus Session',
        'Do you want to end this focus session permanently? This will mark it as incomplete.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'End Session', 
            style: 'destructive',
            onPress: async () => {
              try {
                const updatedBlocks = allBlocks.map(b => 
                  b.id === activeBlock.id 
                    ? { ...b, isActive: false, progress: 50 } // Mark as partially completed
                    : b
                );
                
                setAllBlocks(updatedBlocks);
                await saveTimeBlocks(updatedBlocks);
                
                await updateFocusMode(false); // Show tab bar
                setActiveBlock(null);
                
                // Reload data to update all states
                await loadData();
              } catch (error) {
                console.error('Error ending focus:', error);
              }
            }
          }
        ]
      );
    }
  };

  const getBlockDuration = (block: TimeBlockData) => {
    const start = new Date(`2000-01-01 ${block.startTime}`);
    const end = new Date(`2000-01-01 ${block.endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
  };

  const getTodayStats = () => {
    const completedCount = completedBlocks.length;
    const totalBlocks = todayBlocks.length;
    const totalFocusTime = completedBlocks.reduce((acc, block) => {
      return acc + getBlockDuration(block);
    }, 0);
    
    return {
      completedSessions: completedCount,
      totalSessions: totalBlocks,
      totalFocusTime: Math.round(totalFocusTime),
      completionRate: totalBlocks > 0 ? Math.round((completedCount / totalBlocks) * 100) : 0
    };
  };

  const handleCreateNewBlock = () => {
    router.push('/create-block');
  };

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  const todayStats = getTodayStats();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    focusContainer: {
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
    currentTimeContainer: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    currentTime: {
      fontSize: 24,
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
      marginBottom: 24,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 8,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    activeBlockContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    activeBlockCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    activeBlockHeader: {
      marginBottom: 8,
    },
    activeBlockTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    activeBlockTime: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    activeBlockDate: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
      marginTop: 2,
    },
    activeBlockCategory: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
      marginBottom: 16,
    },
    activeBlockActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 8,
      gap: 8,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
    },
    resumeButton: {
      backgroundColor: colors.secondary,
    },
    endButton: {
      backgroundColor: colors.error,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    primaryButtonText: {
      color: 'white',
    },
    secondaryButtonText: {
      color: colors.textSecondary,
    },
    noActiveContainer: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 40,
    },
    noActiveTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    noActiveSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    upcomingContainer: {
      marginBottom: 24,
    },
    upcomingBlock: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
      borderLeftWidth: 3,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    upcomingBlockContent: {
      flex: 1,
    },
    upcomingBlockTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    upcomingBlockTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    upcomingBlockDate: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '600',
      marginTop: 2,
    },
    miniStartButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    completedContainer: {
      marginBottom: 24,
    },
    completedBlock: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
      borderLeftWidth: 3,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderColor: colors.success,
    },
    completedBlockContent: {
      flex: 1,
    },
    completedBlockTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    completedBlockTime: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    completedBlockDuration: {
      fontSize: 11,
      color: colors.success,
      fontWeight: '600',
    },
    completedIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.success + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
    },
    emptyIcon: {
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 20,
    },
    createBlockButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      gap: 8,
    },
    createBlockText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    tipsContainer: {
      paddingVertical: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 20,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    tipText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
  });

  // SEPARATE FOCUS MODE VIEW - NO TAB BAR
  if (isInFocusMode && activeBlock) {
    return (
      <View style={styles.focusContainer}>
        <FocusTimer
          duration={getBlockDuration(activeBlock)}
          onComplete={handleFocusComplete}
          onStop={handleStopFocus}
          onEnd={handleEndFocus}
          blockTitle={activeBlock.title}
          blockColor={activeBlock.color}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Action Bar Header */}
      <MobileHeader
        title="Focus Mode"
        subtitle="Deep work starts here"
        showNotifications={true}
        onNotificationsPress={() => Alert.alert('Focus Notifications', `Stay focused! You have ${upcomingBlocks.length} upcoming sessions.`)}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.currentTimeContainer}>
            <Text style={styles.currentTime}>{formatTime12Hour(currentTime)}</Text>
          </View>

          {/* Today's Focus Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Today's Focus Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <CheckCircle size={20} color={colors.success} />
                <Text style={styles.statNumber}>{todayStats.completedSessions}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Clock size={20} color={colors.primary} />
                <Text style={styles.statNumber}>{todayStats.totalFocusTime}m</Text>
                <Text style={styles.statLabel}>Focus Time</Text>
              </View>
              <View style={styles.statCard}>
                <Target size={20} color={colors.secondary} />
                <Text style={styles.statNumber}>{todayStats.completionRate}%</Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>
          </View>

          {/* Active Block Section */}
          {activeBlock ? (
            <View style={styles.activeBlockContainer}>
              <Text style={styles.sectionTitle}>Current Active Block</Text>
              <View style={[styles.activeBlockCard, { borderLeftColor: activeBlock.color }]}>
                <View style={styles.activeBlockHeader}>
                  <Text style={styles.activeBlockTitle}>{activeBlock.title}</Text>
                  <Text style={styles.activeBlockTime}>
                    {formatTime12Hour(activeBlock.startTime)} - {formatTime12Hour(activeBlock.endTime)}
                  </Text>
                  <Text style={styles.activeBlockDate}>{formatDate(activeBlock.date)}</Text>
                </View>
                <Text style={styles.activeBlockCategory}>{activeBlock.category}</Text>
                
                <View style={styles.activeBlockActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.resumeButton]}
                    onPress={handleResumeFocus}
                  >
                    <Play size={16} color="white" />
                    <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Resume Focus</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.endButton]}
                    onPress={handleEndFocus}
                  >
                    <Text style={[styles.actionButtonText, styles.primaryButtonText]}>End Session</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noActiveContainer}>
              <Coffee size={48} color={colors.textSecondary} />
              <Text style={styles.noActiveTitle}>No Active Block</Text>
              <Text style={styles.noActiveSubtitle}>
                Select a time block below to start focusing
              </Text>
            </View>
          )}

          {/* Upcoming Blocks */}
          <View style={styles.upcomingContainer}>
            <Text style={styles.sectionTitle}>Available Blocks ({upcomingBlocks.length})</Text>
            {upcomingBlocks.length > 0 ? (
              upcomingBlocks.map((block) => (
                <TouchableOpacity
                  key={block.id}
                  style={[styles.upcomingBlock, { borderLeftColor: block.color }]}
                  onPress={() => handleStartFocus(block)}
                >
                  <View style={styles.upcomingBlockContent}>
                    <Text style={styles.upcomingBlockTitle}>{block.title}</Text>
                    <Text style={styles.upcomingBlockTime}>
                      {formatTime12Hour(block.startTime)} - {formatTime12Hour(block.endTime)}
                    </Text>
                    <Text style={styles.upcomingBlockDate}>{formatDate(block.date)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.miniStartButton, { backgroundColor: block.color }]}
                    onPress={() => handleStartFocus(block)}
                  >
                    <Zap size={14} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Target size={32} color={colors.textSecondary} />
                </View>
                <Text style={styles.emptyText}>
                  No blocks available for focus.{'\n'}Create your next focus session to get started!
                </Text>
                <TouchableOpacity 
                  style={styles.createBlockButton}
                  onPress={handleCreateNewBlock}
                >
                  <Plus size={16} color="white" />
                  <Text style={styles.createBlockText}>Create New Block</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Completed Focus Sessions */}
          <View style={styles.completedContainer}>
            <Text style={styles.sectionTitle}>Completed Today ({completedBlocks.length})</Text>
            {completedBlocks.length > 0 ? (
              completedBlocks.map((block) => (
                <View
                  key={block.id}
                  style={styles.completedBlock}
                >
                  <View style={styles.completedBlockContent}>
                    <Text style={styles.completedBlockTitle}>{block.title}</Text>
                    <Text style={styles.completedBlockTime}>
                      {formatTime12Hour(block.startTime)} - {formatTime12Hour(block.endTime)}
                    </Text>
                    <Text style={styles.completedBlockDuration}>
                      ✓ {getBlockDuration(block)} minutes focused
                    </Text>
                  </View>
                  <View style={styles.completedIcon}>
                    <CheckCircle size={16} color={colors.success} />
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <CheckCircle size={32} color={colors.textSecondary} />
                </View>
                <Text style={styles.emptyText}>
                  No completed focus sessions yet today.{'\n'}Start your first session above!
                </Text>
              </View>
            )}
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Focus Tips</Text>
            <Text style={styles.tipText}>• Put your phone in another room</Text>
            <Text style={styles.tipText}>• Use the Pomodoro technique</Text>
            <Text style={styles.tipText}>• Take breaks every 90 minutes</Text>
            <Text style={styles.tipText}>• Celebrate completed sessions</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}