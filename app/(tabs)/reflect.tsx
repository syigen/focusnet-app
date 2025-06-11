import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Star, BookOpen, TrendingUp, Calendar } from 'lucide-react-native';
import MobileHeader from '@/components/MobileHeader';
import { loadTimeBlocks, loadReflections, saveReflection, DailyReflection } from '@/utils/storage';
import { TimeBlockData } from '@/components/TimeBlock';
import { useTheme } from '@/contexts/ThemeContext';

export default function ReflectScreen() {
  const [blocks, setBlocks] = useState<TimeBlockData[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlockData | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [savedBlocks, savedReflections] = await Promise.all([
      loadTimeBlocks(),
      loadReflections()
    ]);
    setBlocks(savedBlocks);
    setReflections(savedReflections);
  };

  const today = new Date().toDateString();
  const completedBlocks = blocks.filter(block => block.isCompleted);
  const todayReflections = reflections.filter(r => r.date === today);

  const handleBlockSelect = (block: TimeBlockData) => {
    setSelectedBlock(block);
    const existingReflection = todayReflections.find(r => r.blockId === block.id);
    if (existingReflection) {
      setReflectionText(existingReflection.reflection);
      setRating(existingReflection.rating);
    } else {
      setReflectionText('');
      setRating(0);
    }
  };

  const handleSubmitReflection = async () => {
    if (!selectedBlock || !reflectionText.trim()) {
      Alert.alert('Missing Information', 'Please add your reflection before submitting.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Missing Rating', 'Please rate your focus session.');
      return;
    }

    setIsSubmitting(true);

    const reflection: DailyReflection = {
      date: today,
      blockId: selectedBlock.id,
      blockTitle: selectedBlock.title,
      reflection: reflectionText.trim(),
      rating,
    };

    await saveReflection(reflection);
    await loadData();
    
    setSelectedBlock(null);
    setReflectionText('');
    setRating(0);
    setIsSubmitting(false);

    Alert.alert('Reflection Saved', 'Your reflection has been saved successfully!');
  };

  const getAverageRating = () => {
    if (todayReflections.length === 0) return 0;
    const total = todayReflections.reduce((sum, r) => sum + r.rating, 0);
    return total / todayReflections.length;
  };

  const getReflectionPrompts = () => [
    "What went well during this time block?",
    "What would you do differently next time?",
    "How did you feel during this session?",
    "What was your biggest accomplishment?",
    "What challenged you the most?",
  ];

  const renderStars = (currentRating: number, onPress?: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress?.(star)}
            disabled={!onPress}
          >
            <Star
              size={24}
              color={star <= currentRating ? '#FFD700' : colors.border}
              fill={star <= currentRating ? '#FFD700' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
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
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    summaryContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    summaryGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 8,
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    blocksContainer: {
      marginBottom: 24,
    },
    blockCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderLeftWidth: 4,
    },
    reflectedBlock: {
      backgroundColor: colors.success + '10',
      borderColor: colors.success,
      borderWidth: 1,
    },
    blockHeader: {
      marginBottom: 8,
    },
    blockTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    blockMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    blockTime: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    reflectedBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    reflectedText: {
      fontSize: 10,
      color: 'white',
      fontWeight: '600',
    },
    blockCategory: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    reflectionContainer: {
      marginBottom: 24,
    },
    ratingSection: {
      marginBottom: 20,
    },
    ratingLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    starsContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    promptsSection: {
      marginBottom: 20,
    },
    promptsLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    promptText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    textInputSection: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      minHeight: 120,
    },
    submitButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    disabledButton: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    previousReflections: {
      marginBottom: 24,
    },
    reflectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reflectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    reflectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    reflectionContent: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Action Bar Header */}
      <MobileHeader
        title="Daily Reflection"
        subtitle="Learn and improve from today"
        showNotifications={true}
        onNotificationsPress={() => Alert.alert('Reflection Reminder', 'Don\'t forget to reflect on your completed sessions!')}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Today's Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Today's Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <BookOpen size={20} color={colors.primary} />
                <Text style={styles.summaryNumber}>{completedBlocks.length}</Text>
                <Text style={styles.summaryLabel}>Completed</Text>
              </View>
              <View style={styles.summaryCard}>
                <Star size={20} color="#FFD700" />
                <Text style={styles.summaryNumber}>{getAverageRating().toFixed(1)}</Text>
                <Text style={styles.summaryLabel}>Avg Rating</Text>
              </View>
              <View style={styles.summaryCard}>
                <TrendingUp size={20} color={colors.secondary} />
                <Text style={styles.summaryNumber}>{todayReflections.length}</Text>
                <Text style={styles.summaryLabel}>Reflected</Text>
              </View>
            </View>
          </View>

          {/* Completed Blocks */}
          {completedBlocks.length > 0 ? (
            <View style={styles.blocksContainer}>
              <Text style={styles.sectionTitle}>Reflect on Completed Blocks</Text>
              {completedBlocks.map((block) => {
                const hasReflection = todayReflections.some(r => r.blockId === block.id);
                return (
                  <TouchableOpacity
                    key={block.id}
                    style={[
                      styles.blockCard,
                      { borderLeftColor: block.color },
                      hasReflection && styles.reflectedBlock
                    ]}
                    onPress={() => handleBlockSelect(block)}
                  >
                    <View style={styles.blockHeader}>
                      <Text style={styles.blockTitle}>{block.title}</Text>
                      <View style={styles.blockMeta}>
                        <Text style={styles.blockTime}>
                          {block.startTime} - {block.endTime}
                        </Text>
                        {hasReflection && (
                          <View style={styles.reflectedBadge}>
                            <Text style={styles.reflectedText}>✓ Reflected</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={styles.blockCategory}>{block.category}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Completed Blocks Yet</Text>
              <Text style={styles.emptySubtitle}>
                Complete some time blocks to start reflecting on your day
              </Text>
            </View>
          )}

          {/* Reflection Form */}
          {selectedBlock && (
            <View style={styles.reflectionContainer}>
              <Text style={styles.sectionTitle}>
                Reflecting on: {selectedBlock.title}
              </Text>
              
              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>How was your focus? (1-5 stars)</Text>
                {renderStars(rating, setRating)}
              </View>

              <View style={styles.promptsSection}>
                <Text style={styles.promptsLabel}>Reflection Prompts:</Text>
                {getReflectionPrompts().map((prompt, index) => (
                  <Text key={index} style={styles.promptText}>• {prompt}</Text>
                ))}
              </View>

              <View style={styles.textInputSection}>
                <Text style={styles.inputLabel}>Your Reflection</Text>
                <TextInput
                  style={styles.textInput}
                  value={reflectionText}
                  onChangeText={setReflectionText}
                  placeholder="Share your thoughts about this time block..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: selectedBlock.color },
                  isSubmitting && styles.disabledButton
                ]}
                onPress={handleSubmitReflection}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Saving...' : 'Save Reflection'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedBlock(null);
                  setReflectionText('');
                  setRating(0);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Previous Reflections */}
          {todayReflections.length > 0 && !selectedBlock && (
            <View style={styles.previousReflections}>
              <Text style={styles.sectionTitle}>Today's Reflections</Text>
              {todayReflections.map((reflection, index) => (
                <View key={index} style={styles.reflectionCard}>
                  <View style={styles.reflectionHeader}>
                    <Text style={styles.reflectionTitle}>{reflection.blockTitle}</Text>
                    {renderStars(reflection.rating)}
                  </View>
                  <Text style={styles.reflectionContent}>{reflection.reflection}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}