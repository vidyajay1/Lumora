import AsyncStorage from '@react-native-async-storage/async-storage';

// User data management
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

export const loadUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return false;
  }
};

export const updateUserProgress = async (challengeId, completed) => {
  try {
    const userData = await loadUserData();
    if (!userData) return false;

    if (completed) {
      userData.completedChallenges.push({
        id: challengeId,
        completedAt: new Date().toISOString()
      });
      userData.totalChallenges += 1;
      
      // Update streak logic
      const today = new Date().toDateString();
      const lastCompleted = userData.completedChallenges[userData.completedChallenges.length - 2];
      
      if (lastCompleted) {
        const lastDate = new Date(lastCompleted.completedAt).toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        if (lastDate === yesterday) {
          userData.currentStreak += 1;
        } else if (lastDate !== today) {
          userData.currentStreak = 1;
        }
      } else {
        userData.currentStreak = 1;
      }
    }

    await saveUserData(userData);
    return true;
  } catch (error) {
    console.error('Error updating user progress:', error);
    return false;
  }
};

// Challenge history management
export const saveChallengeHistory = async (challenges) => {
  try {
    const history = await loadChallengeHistory();
    const updatedHistory = [...history, ...challenges];
    
    // Keep only last 100 challenges to prevent storage bloat
    if (updatedHistory.length > 100) {
      updatedHistory.splice(0, updatedHistory.length - 100);
    }
    
    await AsyncStorage.setItem('challengeHistory', JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error saving challenge history:', error);
    return false;
  }
};

export const loadChallengeHistory = async () => {
  try {
    const history = await AsyncStorage.getItem('challengeHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading challenge history:', error);
    return [];
  }
};

export const markChallengeCompleted = async (challengeId) => {
  try {
    const history = await loadChallengeHistory();
    const updatedHistory = history.map(challenge => {
      if (challenge.id === challengeId) {
        return {
          ...challenge,
          completed: true,
          completedAt: new Date().toISOString()
        };
      }
      return challenge;
    });
    
    await AsyncStorage.setItem('challengeHistory', JSON.stringify(updatedHistory));
    await updateUserProgress(challengeId, true);
    return true;
  } catch (error) {
    console.error('Error marking challenge completed:', error);
    return false;
  }
};

// App settings and preferences
export const saveUserPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
};

export const loadUserPreferences = async () => {
  try {
    const preferences = await AsyncStorage.getItem('userPreferences');
    return preferences ? JSON.parse(preferences) : {
      difficulty: 'medium',
      categories: ['personal', 'health', 'learning'],
      notifications: true,
      reminderTime: '09:00'
    };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return null;
  }
};

// Clear all data (for testing or reset)
export const clearAllData = async () => {
  try {
    const keys = [
      'userData',
      'challengeHistory',
      'userPreferences',
      'dailyChallenges'
    ];
    
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// Export data for backup
export const exportUserData = async () => {
  try {
    const userData = await loadUserData();
    const challengeHistory = await loadChallengeHistory();
    const preferences = await loadUserPreferences();
    
    return {
      userData,
      challengeHistory,
      preferences,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};
