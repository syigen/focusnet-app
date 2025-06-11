import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch, TextInput, Alert, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, Bell, User, Moon, Sun, Plus, Trash2, CreditCard as Edit, RotateCcw, Database, Sparkles } from 'lucide-react-native';
import MobileHeader from '@/components/MobileHeader';
import { loadCategories, saveCategories, BlockCategory, loadSettings, saveSettings, AppSettings, resetAllData, addSampleData, hasAnyData, debugStorage } from '@/utils/storage';
import { useTheme } from '@/contexts/ThemeContext';
import ClockTimePicker from '@/components/ClockTimePicker';

export default function SettingsScreen() {
  const [categories, setCategories] = useState<BlockCategory[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    isDarkMode: false,
    notificationsEnabled: true,
    workingHours: { start: '09:00', end: '17:00' },
    defaultDuration: 60,
  });
  const [editingCategory, setEditingCategory] = useState<BlockCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isAddingSample, setIsAddingSample] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadData();
    checkForExistingData();
  }, []);

  const loadData = async () => {
    const [savedCategories, savedSettings] = await Promise.all([
      loadCategories(),
      loadSettings()
    ]);
    setCategories(savedCategories);
    setSettings(savedSettings);
  };

  const checkForExistingData = async () => {
    const dataExists = await hasAnyData();
    setHasExistingData(dataExists);
  };

  const handleSettingChange = async (key: keyof AppSettings, value: any) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const handleWorkingHoursChange = async (type: 'start' | 'end', time: string) => {
    const updatedWorkingHours = { ...settings.workingHours, [type]: time };
    const updatedSettings = { ...settings, workingHours: updatedWorkingHours };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const colors = ['#FF6B35', '#2E8B8B', '#8B4F9F', '#4F8B3B', '#B85C38', '#6B4E7D', '#7D6B4E'];
      const usedColors = categories.map(c => c.color);
      const availableColor = colors.find(c => !usedColors.includes(c)) || colors[0];

      const newCategory: BlockCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        color: availableColor,
        icon: 'circle',
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      await saveCategories(updatedCategories);
      setNewCategoryName('');
      
      Alert.alert('Success', `Category "${newCategory.name}" has been added!`);
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category. Please try again.');
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedCategories = categories.filter(c => c.id !== categoryId);
              setCategories(updatedCategories);
              await saveCategories(updatedCategories);
              Alert.alert('Success', 'Category has been deleted!');
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEditCategory = (category: BlockCategory) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const updatedCategories = categories.map(c =>
        c.id === editingCategory.id
          ? { ...c, name: newCategoryName.trim() }
          : c
      );
      
      setCategories(updatedCategories);
      await saveCategories(updatedCategories);
      setEditingCategory(null);
      setNewCategoryName('');
      
      Alert.alert('Success', 'Category has been updated!');
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const handleResetAllData = () => {
    Alert.alert(
      '🗑️ Reset All Data',
      'This will permanently delete ALL your data including:\n\n• All time blocks\n• All reflections\n• All categories\n• All settings\n• Theme preferences\n\nThis action cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              console.log('Starting complete reset process...');
              
              // Debug storage before reset
              await debugStorage();
              
              // Perform complete reset (no sample data)
              const success = await resetAllData();
              
              if (success) {
                console.log('Reset successful, reloading data...');
                
                // Force reload data after reset
                setTimeout(async () => {
                  await loadData();
                  await checkForExistingData();
                  Alert.alert(
                    '✅ Reset Complete', 
                    'All data has been permanently deleted. The app is now completely clean.',
                    [{ text: 'OK', onPress: () => console.log('Reset acknowledged') }]
                  );
                }, 500);
              } else {
                Alert.alert('Error', 'Failed to reset data. Please try again.');
              }
            } catch (error) {
              console.error('Reset error:', error);
              Alert.alert('Error', 'Failed to reset data. Please try again.');
            } finally {
              setIsResetting(false);
            }
          }
        }
      ]
    );
  };

  const handleAddSampleData = () => {
    Alert.alert(
      '✨ Add Sample Data',
      'This will add sample time blocks, categories, and settings to help you get started with the app.\n\nThis is useful for:\n• New users exploring features\n• Testing the app\n• Getting inspiration for your own blocks\n\nContinue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Sample Data',
          onPress: async () => {
            setIsAddingSample(true);
            try {
              console.log('Adding sample data...');
              
              const success = await addSampleData();
              
              if (success) {
                console.log('Sample data added successfully');
                
                // Reload data after adding samples
                setTimeout(async () => {
                  await loadData();
                  await checkForExistingData();
                  Alert.alert(
                    '🎉 Sample Data Added', 
                    'Sample time blocks, categories, and settings have been added to your app. You can now explore all the features!',
                    [{ text: 'Great!', onPress: () => console.log('Sample data acknowledged') }]
                  );
                }, 500);
              } else {
                Alert.alert('Error', 'Failed to add sample data. Please try again.');
              }
            } catch (error) {
              console.error('Add sample data error:', error);
              Alert.alert('Error', 'Failed to add sample data. Please try again.');
            } finally {
              setIsAddingSample(false);
            }
          }
        }
      ]
    );
  };

  const durations = [30, 45, 60, 90, 120];

  // Check if add button should be disabled
  const isAddButtonDisabled = !newCategoryName.trim();

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
    section: {
      backgroundColor: colors.surface,
      marginBottom: 16,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    sectionTitle: {
      fontSize: Math.min(18, screenWidth * 0.045),
      fontWeight: '700',
      color: colors.text,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      minHeight: 44,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      flex: 1,
    },
    settingDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },
    durationContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
      flexWrap: 'wrap',
    },
    durationButton: {
      flex: 1,
      minWidth: 60,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      minHeight: 44,
    },
    selectedDuration: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    durationText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    selectedDurationText: {
      color: 'white',
    },
    addCategoryContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    categoryInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      minHeight: 44,
    },
    addCategoryButton: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addCategoryButtonDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.5,
    },
    editButton: {
      backgroundColor: colors.secondary,
    },
    cancelEditButton: {
      alignItems: 'center',
      marginBottom: 16,
    },
    cancelEditText: {
      color: colors.error,
      fontSize: 14,
      fontWeight: '500',
    },
    categoriesList: {
      gap: 8,
    },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      minHeight: 44,
    },
    categoryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    categoryColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    categoryName: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      flex: 1,
    },
    categoryActions: {
      flexDirection: 'row',
      gap: 12,
    },
    categoryActionButton: {
      padding: 8,
      minWidth: 32,
      minHeight: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    appVersion: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 8,
    },
    appDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    dataManagementSection: {
      marginBottom: 16,
    },
    dataButton: {
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      minHeight: 56,
    },
    resetButton: {
      backgroundColor: colors.error,
      opacity: isResetting ? 0.6 : 1,
    },
    sampleDataButton: {
      backgroundColor: colors.secondary,
      opacity: isAddingSample ? 0.6 : 1,
    },
    dataButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    dataDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
      marginBottom: 8,
    },
    dataStatusContainer: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dataStatusText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    dataStatusIcon: {
      alignSelf: 'center',
      marginBottom: 4,
    },
  });

  return (
    <View style={styles.container}>
      {/* Action Bar Header */}
      <MobileHeader
        title="Settings"
        subtitle="Customize your FocusNest"
        showNotifications={true}
        onNotificationsPress={() => Alert.alert('Settings Notifications', 'Manage your notification preferences below.')}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Appearance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              {isDarkMode ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.primary} />}
              <Text style={styles.sectionTitle}>Appearance</Text>
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? '#FFF' : '#FFF'}
              />
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color={colors.secondary} />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => handleSettingChange('notificationsEnabled', value)}
                trackColor={{ false: colors.border, true: colors.secondary }}
                thumbColor={settings.notificationsEnabled ? '#FFF' : '#FFF'}
              />
            </View>
            
            <Text style={styles.settingDescription}>
              Get reminders when blocks start and end
            </Text>
          </View>

          {/* Working Hours */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color={colors.accent} />
              <Text style={styles.sectionTitle}>Working Hours</Text>
            </View>
            
            <ClockTimePicker
              value={settings.workingHours.start}
              onTimeChange={(time) => handleWorkingHoursChange('start', time)}
              label="Start Time"
            />
            
            <ClockTimePicker
              value={settings.workingHours.end}
              onTimeChange={(time) => handleWorkingHoursChange('end', time)}
              label="End Time"
            />
          </View>

          {/* Default Duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Default Block Duration</Text>
            <View style={styles.durationContainer}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    settings.defaultDuration === duration && styles.selectedDuration
                  ]}
                  onPress={() => handleSettingChange('defaultDuration', duration)}
                >
                  <Text
                    style={[
                      styles.durationText,
                      settings.defaultDuration === duration && styles.selectedDurationText
                    ]}
                  >
                    {duration}min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Palette size={20} color={colors.accent} />
              <Text style={styles.sectionTitle}>Block Categories</Text>
            </View>
            
            {/* Add New Category */}
            <View style={styles.addCategoryContainer}>
              <TextInput
                style={styles.categoryInput}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder={editingCategory ? "Edit category name..." : "Add new category..."}
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={editingCategory ? handleSaveEdit : handleAddCategory}
              />
              <TouchableOpacity
                style={[
                  styles.addCategoryButton,
                  editingCategory && styles.editButton,
                  isAddButtonDisabled && styles.addCategoryButtonDisabled
                ]}
                onPress={editingCategory ? handleSaveEdit : handleAddCategory}
                disabled={isAddButtonDisabled}
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            {editingCategory && (
              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelEditText}>Cancel Edit</Text>
              </TouchableOpacity>
            )}

            {/* Category List */}
            <View style={styles.categoriesList}>
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[styles.categoryColor, { backgroundColor: category.color }]}
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryActions}>
                    <TouchableOpacity
                      style={styles.categoryActionButton}
                      onPress={() => handleEditCategory(category)}
                    >
                      <Edit size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.categoryActionButton}
                      onPress={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Data Management */}
          <View style={[styles.section, styles.dataManagementSection]}>
            <View style={styles.sectionHeader}>
              <Database size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Data Management</Text>
            </View>

            {/* Data Status */}
            <View style={styles.dataStatusContainer}>
              <View style={styles.dataStatusIcon}>
                {hasExistingData ? (
                  <Database size={16} color={colors.success} />
                ) : (
                  <Database size={16} color={colors.textSecondary} />
                )}
              </View>
              <Text style={styles.dataStatusText}>
                {hasExistingData 
                  ? '✅ You have existing data in the app'
                  : '📭 No data found - app is empty'
                }
              </Text>
            </View>

            {/* Add Sample Data Button */}
            <TouchableOpacity 
              style={[styles.dataButton, styles.sampleDataButton]}
              onPress={handleAddSampleData}
              disabled={isAddingSample}
            >
              <Sparkles size={16} color="white" />
              <Text style={styles.dataButtonText}>
                {isAddingSample ? 'Adding Sample Data...' : 'Add Sample Data'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dataDescription}>
              Add example time blocks, categories, and settings to explore the app's features.
            </Text>

            {/* Reset All Data Button */}
            <TouchableOpacity 
              style={[styles.dataButton, styles.resetButton]}
              onPress={handleResetAllData}
              disabled={isResetting}
            >
              <RotateCcw size={16} color="white" />
              <Text style={styles.dataButtonText}>
                {isResetting ? 'Deleting All Data...' : 'Reset All Data'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dataDescription}>
              Permanently delete all your blocks, reflections, categories, and settings.{'\n'}
              This action cannot be undone.
            </Text>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About FocusNest</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Your personal time blocking companion for better focus and productivity.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}