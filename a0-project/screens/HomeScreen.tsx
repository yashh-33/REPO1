import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';

export default function NewsAnalyzerScreen() {
  const [newsText, setNewsText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeNews = async () => {
    if (newsText.trim().length < 20) {
      toast.error('Please enter a longer text to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a fake news detection expert. Analyze the given text and return a JSON response with the following structure: { credibilityScore: number (0-100), analysis: string (main findings), redFlags: string[] (list of concerning elements), recommendations: string[] (fact-checking steps) }'
            },
            {
              role: 'user',
              content: `Analyze this news text for potential misinformation: ${newsText}`
            }
          ]
        })
      });

      const data = await response.json();
      const analysisResult = JSON.parse(data.completion);
      setAnalysis(analysisResult);
    } catch (error) {
      toast.error('Error analyzing text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#4CAF50';
    if (score >= 40) return '#FFC107';
    return '#F44336';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="security" size={24} color="#333" />
        <Text style={styles.headerText}>Fake News Analyzer</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Paste news article or text:</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Enter the text you want to analyze..."
          value={newsText}
          onChangeText={setNewsText}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={analyzeNews}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Analyze Text</Text>
          )}
        </TouchableOpacity>

        {analysis && (
          <View style={styles.resultsContainer}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Credibility Score</Text>
              <Text
                style={[
                  styles.score,
                  { color: getScoreColor(analysis.credibilityScore) }
                ]}
              >
                {analysis.credibilityScore}%
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Analysis</Text>
            <Text style={styles.analysisText}>{analysis.analysis}</Text>

            <Text style={styles.sectionTitle}>Red Flags</Text>
            {analysis.redFlags.map((flag, index) => (
              <View key={index} style={styles.flagItem}>
                <MaterialIcons name="warning" size={20} color="#F44336" />
                <Text style={styles.flagText}>{flag}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Recommendations</Text>
            {analysis.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    height: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  flagText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  recommendationText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
});