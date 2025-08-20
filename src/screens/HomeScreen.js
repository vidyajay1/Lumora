import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getTodaysChallenges } from '../services/aiService';
import ChallengeCard from '../components/ChallengeCard';
import DailyProgress from '../components/DailyProgress';
import Header from '../components/Header';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadTodaysChallenges();
  }, []);

  const loadTodaysChallenges = async () => {
    try {
      setLoading(true);
      const todaysChallenges = await getTodaysChallenges();
      setChallenges(todaysChallenges);
      updateCompletedCount(todaysChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
      Alert.alert('Error', 'Failed to load today\'s challenges');
    } finally {
      setLoading(false);
    }
  };

  const updateCompletedCount = (challengeList) => {
    const completed = challengeList.filter(challenge => challenge.completed).length;
    setCompletedCount(completed);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodaysChallenges();
    setRefreshing(false);
  };

  const handleChallengeComplete = (challengeId) => {
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.id === challengeId) {
        return {
          ...challenge,
          completed: !challenge.completed,
          completedAt: !challenge.completed ? new Date().toISOString() : null
        };
      }
      return challenge;
    });
    
    setChallenges(updatedChallenges);
    updateCompletedCount(updatedChallenges);
    
    // Save updated challenges
    // In a real app, you'd also update user progress, streaks, etc.
  };

  const handleChallengePress = (challenge) => {
    navigation.navigate('Challenge', { challenge });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  };

  const getMotivationalMessage = () => {
    const messages = [
      'Ready to conquer today\'s challenges?',
      'Every challenge is an opportunity to grow!',
      'You\'ve got this! Let\'s make today amazing!',
      'Small steps lead to big changes!',
      'Today is your day to shine!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="refresh" size={40} color="#6200EE" />
        <Text style={styles.loadingText}>Loading your daily challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Daily Challenges" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.motivationalMessage}>{getMotivationalMessage()}</Text>
        </View>

        {/* Progress Section */}
        <DailyProgress 
          completed={completedCount} 
          total={challenges.length} 
        />

        {/* Challenges Section */}
        <View style={styles.challengesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Challenges</Text>
            <Text style={styles.sectionSubtitle}>
              {challenges.length} AI-generated challenges just for you
            </Text>
          </View>

          {challenges.map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onPress={() => handleChallengePress(challenge)}
              onComplete={() => handleChallengeComplete(challenge.id)}
              index={index}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Challenges')}
          >
            <Icon name="emoji-events" size={24} color="#6200EE" />
            <Text style={styles.actionButtonText}>View All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="person" size={24} color="#6200EE" />
            <Text style={styles.actionButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  greetingSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  motivationalMessage: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  challengesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
  },
  bottomSpacer: {
    height: 100,
  },
});
```
