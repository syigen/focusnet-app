import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { ChevronLeft, ChevronRight, ChartBar as BarChart3, ChartPie as PieChart } from 'lucide-react-native';
import MobileHeader from '@/components/MobileHeader';
import { loadTimeBlocks, saveTimeBlocks } from '@/utils/storage';
import { TimeBlockData } from '@/components/TimeBlock';
import { useTheme } from '@/contexts/ThemeContext';

export default function WeeklyScreen() {
  const [blocks, setBlocks] = useState<TimeBlockData[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { colors } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedBlocks = await loadTimeBlocks();
    setBlocks(savedBlocks);
  };

  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDate);
    }
    return weekDates;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const handleCopyThisWeek = async () => {
    try {
      Alert.alert(
        'Copy This Week',
        'This will duplicate all time blocks from this week to next week. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Copy', 
            onPress: async () => {
              // Create copies of all blocks with new IDs
              const copiedBlocks = blocks.map(block => ({
                ...block,
                id: `${Date.now()}-${Math.random()}`,
                isActive: false,
                isCompleted: false,
                progress: 0,
              }));

              const updatedBlocks = [...blocks, ...copiedBlocks];
              await saveTimeBlocks(updatedBlocks);
              await loadData();
              
              Alert.alert('Success', `${copiedBlocks.length} blocks have been copied to next week!`);
            }
          },
        ]
      );
    } catch (error) {
      console.error('Error copying week:', error);
      Alert.alert('Error', 'Failed to copy this week. Please try again.');
    }
  };

  const handleExportSummary = () => {
    const stats = getWeekStats();
    const summary = `
Weekly Summary:
- Total Hours Planned: ${Math.round(stats.totalHours)}h
- Completion Rate: ${Math.round((stats.completedBlocks / stats.totalBlocks) * 100)}%
- Blocks Completed: ${stats.completedBlocks}/${stats.totalBlocks}

Category Breakdown:
${Object.entries(stats.categoryStats).map(([category, hours]) => 
  `- ${category}: ${Math.round(hours)}h`
).join('\n')}
    `.trim();

    Alert.alert(
      'Weekly Summary',
      summary,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            // In a real app, you would use a sharing library here
            Alert.alert('Share', 'Summary copied to clipboard! (In a real app, this would open the share dialog)');
          }
        },
      ]
    );
  };

  const getWeekStats = () => {
    const totalBlocks = blocks.length * 7; // Assuming same blocks for each day
    const completedBlocks = blocks.filter(b => b.isCompleted).length * 7;
    const totalHours = blocks.reduce((acc, block) => {
      const start = new Date(`2000-01-01 ${block.startTime}`);
      const end = new Date(`2000-01-01 ${block.endTime}`);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0) * 7;

    const categoryStats = blocks.reduce((acc, block) => {
      const duration = (() => {
        const start = new Date(`2000-01-01 ${block.startTime}`);
        const end = new Date(`2000-01-01 ${block.endTime}`);
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      })();
      
      acc[block.category] = (acc[block.category] || 0) + duration * 7;
      return acc;
    }, {} as Record<string, number>);

    return { totalBlocks, completedBlocks, totalHours, categoryStats };
  };

  const weekDates = getWeekDates(currentWeek);
  const stats = getWeekStats();
  const weekRange = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    weekNavigation: {
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
    weekRange: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 24,
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
    calendarContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    calendarGrid: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dayColumn: {
      flex: 1,
      alignItems: 'center',
    },
    dayName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    dayBlocks: {
      gap: 4,
    },
    miniBlock: {
      width: 24,
      height: 20,
      borderRadius: 3,
      overflow: 'hidden',
    },
    miniBlockFill: {
      width: '100%',
      borderRadius: 3,
    },
    categoryContainer: {
      marginBottom: 24,
    },
    categoryItem: {
      marginBottom: 16,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    categoryDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    categoryName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    categoryHours: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    categoryBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    categoryBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    insightsContainer: {
      marginBottom: 24,
    },
    insightCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    insightTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    insightText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    actionsContainer: {
      paddingBottom: 32,
      gap: 12,
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    actionButtonText: {
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
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Action Bar Header */}
      <MobileHeader
        title="Weekly Overview"
        subtitle="Track your progress"
        showNotifications={true}
        onNotificationsPress={() => Alert.alert('Weekly Insights', 'You\'re on track to beat last week\'s focus time!')}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Week Navigation */}
          <View style={styles.weekNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateWeek('prev')}
            >
              <ChevronLeft size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <Text style={styles.weekRange}>{weekRange}</Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateWeek('next')}
            >
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Week Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <BarChart3 size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{Math.round(stats.totalHours)}h</Text>
              <Text style={styles.statLabel}>Total Planned</Text>
            </View>
            <View style={styles.statCard}>
              <PieChart size={24} color={colors.secondary} />
              <Text style={styles.statNumber}>
                {Math.round((stats.completedBlocks / stats.totalBlocks) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>

          {/* Weekly Calendar Grid */}
          <View style={styles.calendarContainer}>
            <Text style={styles.sectionTitle}>Week at a Glance</Text>
            <View style={styles.calendarGrid}>
              {weekDates.map((date, index) => (
                <View key={index} style={styles.dayColumn}>
                  <Text style={styles.dayName}>{dayNames[index]}</Text>
                  <Text style={styles.dayNumber}>{date.getDate()}</Text>
                  
                  <View style={styles.dayBlocks}>
                    {blocks.slice(0, 4).map((block, blockIndex) => (
                      <View 
                        key={blockIndex}
                        style={[
                          styles.miniBlock, 
                          { backgroundColor: block.color + '40' }
                        ]}
                      >
                        <View 
                          style={[
                            styles.miniBlockFill, 
                            { 
                              backgroundColor: block.color,
                              height: block.isCompleted ? '100%' : `${block.progress || 0}%`
                            }
                          ]} 
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.categoryContainer}>
            <Text style={styles.sectionTitle}>Time by Category</Text>
            {Object.entries(stats.categoryStats).map(([category, hours]) => {
              const percentage = (hours / stats.totalHours) * 100;
              const categoryColor = blocks.find(b => b.category === category)?.color || colors.textSecondary;
              
              return (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.categoryHours}>{Math.round(hours)}h</Text>
                  </View>
                  <View style={styles.categoryBar}>
                    <View 
                      style={[
                        styles.categoryBarFill, 
                        { 
                          width: `${percentage}%`,
                          backgroundColor: categoryColor 
                        }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Weekly Insights */}
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>Weekly Insights</Text>
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>🎯 Most Productive Day</Text>
              <Text style={styles.insightText}>Tuesday - 6 blocks completed</Text>
            </View>
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>⚡ Favorite Focus Time</Text>
              <Text style={styles.insightText}>9:00 AM - 11:00 AM</Text>
            </View>
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>📈 Improvement Streak</Text>
              <Text style={styles.insightText}>3 days of hitting your goals!</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCopyThisWeek}>
              <Text style={styles.actionButtonText}>Copy This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={handleExportSummary}
            >
              <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
                Export Summary
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}