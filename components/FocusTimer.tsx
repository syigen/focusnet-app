import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, StatusBar, Dimensions } from 'react-native';
import { X, Pause, Play, RotateCcw, LogOut } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface FocusTimerProps {
  duration: number; // in minutes
  onComplete: () => void;
  onStop: () => void;
  onEnd: () => void;
  blockTitle: string;
  blockColor: string;
}

export default function FocusTimer({
                                     duration,
                                     onComplete,
                                     onStop,
                                     onEnd,
                                     blockTitle,
                                     blockColor
                                   }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const { colors } = useTheme();

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    let interval: number;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft, onComplete]);

  useEffect(() => {
    const pulse = () => {
      if (isRunning && !isPaused) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isRunning && !isPaused) pulse();
        });
      }
    };

    if (isRunning && !isPaused) pulse();
  }, [isRunning, isPaused, pulseAnim]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const toggleTimer = () => {
    if (timeLeft <= 0) return;

    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
    } else {
      setIsPaused(true);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    Alert.alert(
      'Reset Timer',
      'Are you sure you want to reset the timer? This will restart your focus session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setTimeLeft(duration * 60);
            setIsRunning(true);
            setIsPaused(false);
          }
        }
      ]
    );
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Focus Mode',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause & Exit',
          onPress: () => {
            setIsRunning(false);
            setIsPaused(true);
            onStop();
          }
        },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            setIsRunning(false);
            setIsPaused(false);
            onEnd();
          }
        }
      ]
    );
  };

  const getTimerStatus = () => {
    if (timeLeft <= 0) return 'completed';
    if (isPaused) return 'paused';
    if (isRunning) return 'running';
    return 'stopped';
  };

  const getStatusText = () => {
    const status = getTimerStatus();
    switch (status) {
      case 'completed': return 'Session Complete! 🎉';
      case 'paused': return 'Paused';
      case 'running': return 'Deep Focus Mode';
      default: return 'Ready to Focus';
    }
  };

  const getStatusColor = () => {
    const status = getTimerStatus();
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'paused': return '#FFB800';
      case 'running': return blockColor;
      default: return 'rgba(255, 255, 255, 0.6)';
    }
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "The successful warrior is the average person with laser-like focus.",
      "Focus is a matter of deciding what things you're not going to do.",
      "Where focus goes, energy flows and results show.",
      "The art of being wise is knowing what to overlook.",
      "Concentrate all your thoughts upon the work at hand.",
      "Focus on being productive instead of busy.",
      "Your focus determines your reality.",
      "The key to success is to focus our conscious mind on things we desire.",
    ];

    const quoteIndex = Math.floor((duration * 60 - timeLeft) / 60) % quotes.length;
    return quotes[quoteIndex];
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingTop: 80,
      paddingBottom: 180, // Make room for bottom panel
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: 60,
      maxWidth: screenWidth * 0.9,
    },
    blockTitle: {
      fontSize: Math.min(screenWidth * 0.06, 28),
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 20,
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    statusContainer: {
      backgroundColor: getStatusColor() + '20',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: getStatusColor() + '40',
    },
    statusText: {
      fontSize: 14,
      color: getStatusColor(),
      fontWeight: '600',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    timerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
    },
    timerCircle: {
      width: Math.min(screenWidth * 0.65, 260),
      height: Math.min(screenWidth * 0.65, 260),
      borderRadius: Math.min(screenWidth * 0.325, 130),
      borderWidth: 4,
      borderColor: blockColor,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      marginBottom: 30,
      shadowColor: blockColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 15,
    },
    timeText: {
      fontSize: Math.min(screenWidth * 0.12, 44),
      fontWeight: '900',
      color: blockColor,
      marginBottom: 4,
      letterSpacing: -1,
      textAlign: 'center',
    },
    remainingText: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.6)',
      fontWeight: '600',
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    progressContainer: {
      width: '100%',
      alignItems: 'center',
      maxWidth: 260,
      marginBottom: 30,
    },
    progressBar: {
      width: '100%',
      height: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 12,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: blockColor,
    },
    progressText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: '600',
      marginBottom: 20,
    },
    // CONTROLS BELOW PROGRESS
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      paddingHorizontal: 20,
    },
    controlButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    primaryButton: {
      backgroundColor: blockColor,
      shadowColor: blockColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    resetButton: {
      backgroundColor: 'rgba(255, 184, 0, 0.2)',
      borderWidth: 2,
      borderColor: 'rgba(255, 184, 0, 0.6)',
    },
    exitButton: {
      backgroundColor: 'rgba(255, 68, 68, 0.2)',
      borderWidth: 2,
      borderColor: 'rgba(255, 68, 68, 0.6)',
    },
    // BOTTOM PANEL FOR MOTIVATION
    bottomPanel: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 24,
      paddingVertical: 20,
      paddingBottom: 40,
    },
    motivationText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.6)',
      fontStyle: 'italic',
      textAlign: 'center',
      lineHeight: 20,
      fontWeight: '400',
    },
    completedContainer: {
      position: 'absolute',
      bottom: 100,
      alignSelf: 'center',
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: 'rgba(76, 175, 80, 0.4)',
    },
    completedText: {
      fontSize: 16,
      color: '#4CAF50',
      fontWeight: '700',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.blockTitle}>{blockTitle}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        <View style={styles.timerContainer}>
          <Animated.View
            style={[
              styles.timerCircle,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Text style={styles.timeText}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={styles.remainingText}>
              {timeLeft <= 0 ? 'COMPLETE' : 'REMAINING'}
            </Text>
          </Animated.View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgress()}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(getProgress())}% Complete
            </Text>

            {/* CONTROLS DIRECTLY BELOW PROGRESS */}
            <View style={styles.controls}>
              {/* Play/Pause Button */}
              {timeLeft > 0 && (
                <TouchableOpacity
                  style={[styles.controlButton, styles.primaryButton]}
                  onPress={toggleTimer}
                  activeOpacity={0.7}
                >
                  {isPaused ? (
                    <Play size={24} color="white" />
                  ) : (
                    <Pause size={24} color="white" />
                  )}
                </TouchableOpacity>
              )}

              {/* Reset Button */}
              {timeLeft > 0 && (
                <TouchableOpacity
                  style={[styles.controlButton, styles.resetButton]}
                  onPress={resetTimer}
                  activeOpacity={0.7}
                >
                  <RotateCcw size={20} color="#FFB800" />
                </TouchableOpacity>
              )}

              {/* Exit Button - Always Available */}
              <TouchableOpacity
                style={[styles.controlButton, styles.exitButton]}
                onPress={handleExit}
                activeOpacity={0.7}
              >
                <LogOut size={20} color="#FF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Session Complete Message */}
      {timeLeft <= 0 && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>
            🎉 Session Complete! Use exit button to continue.
          </Text>
        </View>
      )}

      {/* BOTTOM PANEL WITH MOTIVATIONAL QUOTE */}
      <View style={styles.bottomPanel}>
        <Text style={styles.motivationText}>
          "{getMotivationalQuote()}"
        </Text>
      </View>
    </View>
  );
}