import AsyncStorage from '@react-native-async-storage/async-storage';

// In a real app, you would integrate with OpenAI, Anthropic, or similar AI services
// For now, I'll create a sophisticated challenge generation system that simulates AI

const CHALLENGE_TEMPLATES = {
  personal: [
    {
      type: 'reflection',
      templates: [
        'Take 10 minutes to write about something you\'re grateful for today',
        'Reflect on a recent challenge and what you learned from it',
        'Write down three things you want to improve about yourself'
      ]
    },
    {
      type: 'connection',
      templates: [
        'Reach out to someone you haven\'t talked to in a while',
        'Give a genuine compliment to three different people today',
        'Listen actively to someone without interrupting for 5 minutes'
      ]
    }
  ],
  health: [
    {
      type: 'physical',
      templates: [
        'Do 20 push-ups or 10 minutes of stretching',
        'Take a 15-minute walk outside',
        'Drink 8 glasses of water today',
        'Try a new healthy recipe for dinner'
      ]
    },
    {
      type: 'mental',
      templates: [
        'Practice deep breathing for 5 minutes',
        'Take a 10-minute break from all screens',
        'Do something that makes you laugh today',
        'Practice mindfulness while eating one meal'
      ]
    }
  ],
  learning: [
    {
      type: 'skill',
      templates: [
        'Learn one new word in a language you\'re studying',
        'Watch a 10-minute educational video on a new topic',
        'Read 20 pages of a book you\'ve been meaning to finish',
        'Practice a musical instrument for 15 minutes'
      ]
    },
    {
      type: 'knowledge',
      templates: [
        'Research a topic you\'re curious about for 15 minutes',
        'Ask someone about their expertise or passion',
        'Try to solve a puzzle or brain teaser',
        'Learn about a historical event that happened on this date'
      ]
    }
  ]
};

const DIFFICULTY_MODIFIERS = {
  easy: { time: 5, effort: 1, complexity: 1 },
  medium: { time: 15, effort: 2, complexity: 2 },
  hard: { time: 30, effort: 3, complexity: 3 }
};

class AIChallengeGenerator {
  constructor() {
    this.userPreferences = null;
    this.challengeHistory = [];
  }

  async initialize() {
    await this.loadUserPreferences();
    await this.loadChallengeHistory();
  }

  async loadUserPreferences() {
    try {
      const prefs = await AsyncStorage.getItem('userPreferences');
      this.userPreferences = prefs ? JSON.parse(prefs) : {
        difficulty: 'medium',
        categories: ['personal', 'health', 'learning']
      };
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  async loadChallengeHistory() {
    try {
      const history = await AsyncStorage.getItem('challengeHistory');
      this.challengeHistory = history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }

  generateDailyChallenges() {
    const challenges = [];
    const categories = this.userPreferences.categories;
    
    // Ensure we get 3 challenges, one from each category if possible
    const selectedCategories = this.selectCategories(categories);
    
    selectedCategories.forEach((category, index) => {
      const challenge = this.generateChallengeForCategory(category, index);
      challenges.push(challenge);
    });

    return challenges;
  }

  selectCategories(availableCategories) {
    const categories = [...availableCategories];
    const selected = [];
    
    // Always try to get 3 different categories
    while (selected.length < 3 && categories.length > 0) {
      const randomIndex = Math.floor(Math.random() * categories.length);
      selected.push(categories[randomIndex]);
      categories.splice(randomIndex, 1);
    }
    
    // If we don't have 3 categories, repeat some
    while (selected.length < 3) {
      const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
      selected.push(randomCategory);
    }
    
    return selected.slice(0, 3);
  }

  generateChallengeForCategory(category, index) {
    const templates = CHALLENGE_TEMPLATES[category];
    const templateGroup = templates[Math.floor(Math.random() * templates.length)];
    const template = templateGroup.templates[Math.floor(Math.random() * templateGroup.templates.length)];
    
    const difficulty = this.userPreferences.difficulty;
    const modifiers = DIFFICULTY_MODIFIERS[difficulty];
    
    // Personalize the challenge based on user history and preferences
    const personalizedChallenge = this.personalizeChallenge(template, category, difficulty);
    
    return {
      id: `challenge_${Date.now()}_${index}`,
      title: this.generateTitle(personalizedChallenge, category),
      description: personalizedChallenge,
      category: category,
      type: templateGroup.type,
      difficulty: difficulty,
      estimatedTime: modifiers.time,
      effortLevel: modifiers.effort,
      complexity: modifiers.complexity,
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
      userNotes: '',
      aiGenerated: true,
      personalizationFactors: this.getPersonalizationFactors()
    };
  }

  personalizeChallenge(template, category, difficulty) {
    let personalized = template;
    
    // Add time-based personalization
    const hour = new Date().getHours();
    if (hour < 12) {
      personalized = personalized.replace('today', 'this morning');
    } else if (hour < 17) {
      personalized = personalized.replace('today', 'this afternoon');
    } else {
      personalized = personalized.replace('today', 'this evening');
    }
    
    // Add difficulty-based personalization
    if (difficulty === 'easy') {
      personalized = personalized.replace('15 minutes', '5 minutes');
      personalized = personalized.replace('20 push-ups', '10 push-ups');
    } else if (difficulty === 'hard') {
      personalized = personalized.replace('5 minutes', '15 minutes');
      personalized = personalized.replace('10 push-ups', '30 push-ups');
    }
    
    return personalized;
  }

  generateTitle(challenge, category) {
    const categoryEmojis = {
      personal: '💭',
      health: '💪',
      learning: '🧠'
    };
    
    const emoji = categoryEmojis[category] || '✨';
    const words = challenge.split(' ').slice(0, 4).join(' ');
    return `${emoji} ${words}...`;
  }

  getPersonalizationFactors() {
    return {
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      userDifficulty: this.userPreferences.difficulty,
      recentCategories: this.getRecentCategories(),
      successRate: this.calculateSuccessRate()
    };
  }

  getRecentCategories() {
    const recent = this.challengeHistory.slice(-10);
    return recent.reduce((acc, challenge) => {
      acc[challenge.category] = (acc[challenge.category] || 0) + 1;
      return acc;
    }, {});
  }

  calculateSuccessRate() {
    if (this.challengeHistory.length === 0) return 0.8; // Default optimistic rate
    
    const completed = this.challengeHistory.filter(c => c.completed).length;
    return completed / this.challengeHistory.length;
  }

  async saveChallenges(challenges) {
    try {
      const today = new Date().toDateString();
      const key = `dailyChallenges_${today}`;
      await AsyncStorage.setItem(key, JSON.stringify(challenges));
      
      // Also save to general history
      this.challengeHistory.push(...challenges);
      await AsyncStorage.setItem('challengeHistory', JSON.stringify(this.challengeHistory));
      
      return true;
    } catch (error) {
      console.error('Error saving challenges:', error);
      return false;
    }
  }

  async getTodaysChallenges() {
    try {
      const today = new Date().toDateString();
      const key = `dailyChallenges_${today}`;
      const challenges = await AsyncStorage.getItem(key);
      
      if (challenges) {
        return JSON.parse(challenges);
      }
      
      // Generate new challenges if none exist for today
      const newChallenges = this.generateDailyChallenges();
      await this.saveChallenges(newChallenges);
      return newChallenges;
      
    } catch (error) {
      console.error('Error getting today\'s challenges:', error);
      return [];
    }
  }
}

// Create and export singleton instance
const aiChallengeGenerator = new AIChallengeGenerator();

export const initializeAIChallenges = async () => {
  await aiChallengeGenerator.initialize();
};

export const generateDailyChallenges = () => {
  return aiChallengeGenerator.generateDailyChallenges();
};

export const getTodaysChallenges = async () => {
  return await aiChallengeGenerator.getTodaysChallenges();
};

export const saveChallenges = async (challenges) => {
  return await aiChallengeGenerator.saveChallenges(challenges);
};

export default aiChallengeGenerator;
