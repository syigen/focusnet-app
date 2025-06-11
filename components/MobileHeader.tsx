import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Settings, User, Menu } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  showProfile?: boolean;
  showMenu?: boolean;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
  onProfilePress?: () => void;
  onMenuPress?: () => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  backgroundColor?: string;
  minimal?: boolean;
}

export default function MobileHeader({
  title,
  subtitle,
  showNotifications = false,
  showSettings = false,
  showProfile = false,
  showMenu = false,
  onNotificationsPress,
  onSettingsPress,
  onProfilePress,
  onMenuPress,
  rightComponent,
  leftComponent,
  backgroundColor,
  minimal = false,
}: MobileHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 400;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: backgroundColor || colors.background,
      paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 20 : 10),
      paddingBottom: minimal ? 8 : 16,
      paddingHorizontal: Math.max(20, screenWidth * 0.05),
      paddingLeft: Math.max(insets.left + 20, screenWidth * 0.05),
      paddingRight: Math.max(insets.right + 20, screenWidth * 0.05),
      borderBottomWidth: minimal ? 0 : 1,
      borderBottomColor: colors.border,
      shadowColor: minimal ? 'transparent' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: minimal ? 0 : 0.05,
      shadowRadius: minimal ? 0 : 8,
      elevation: minimal ? 0 : 3,
      zIndex: 1000, // Ensure header stays above other content
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 44,
    },
    leftSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },
    titleContainer: {
      flex: 1,
      marginLeft: leftComponent ? 12 : 0,
      minWidth: 0,
    },
    title: {
      fontSize: isSmallScreen ? 18 : 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: subtitle ? 2 : 0,
    },
    subtitle: {
      fontSize: isSmallScreen ? 12 : 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    notificationButton: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary + '30',
    },
    profileButton: {
      backgroundColor: colors.secondary + '15',
      borderColor: colors.secondary + '30',
    },
    menuButton: {
      backgroundColor: colors.accent + '15',
      borderColor: colors.accent + '30',
    },
    notificationDot: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.error,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.leftSection}>
          {leftComponent}
          
          {(title || subtitle) && (
            <View style={styles.titleContainer}>
              {title && <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text>}
              {subtitle && <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">{subtitle}</Text>}
            </View>
          )}
        </View>

        <View style={styles.rightSection}>
          {rightComponent}
          
          {showMenu && (
            <TouchableOpacity
              style={[styles.actionButton, styles.menuButton]}
              onPress={onMenuPress}
            >
              <Menu size={18} color={colors.accent} />
            </TouchableOpacity>
          )}

          {showNotifications && (
            <TouchableOpacity
              style={[styles.actionButton, styles.notificationButton]}
              onPress={onNotificationsPress}
            >
              <Bell size={18} color={colors.primary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          )}

          {showProfile && (
            <TouchableOpacity
              style={[styles.actionButton, styles.profileButton]}
              onPress={onProfilePress}
            >
              <User size={18} color={colors.secondary} />
            </TouchableOpacity>
          )}

          {showSettings && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSettingsPress}
            >
              <Settings size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}