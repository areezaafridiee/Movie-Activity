// MovieScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing
} from 'react-native';

const MovieScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [error, setError] = useState(null);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  // Comprehensive fallback movie data
  const fallbackMovies = [
    { id: '1', title: 'The Shawshank Redemption', releaseYear: '1994' },
    { id: '2', title: 'The Godfather', releaseYear: '1972' },
    { id: '3', title: 'The Dark Knight', releaseYear: '2008' },
    { id: '4', title: 'Pulp Fiction', releaseYear: '1994' },
    { id: '5', title: 'Forrest Gump', releaseYear: '1994' },
    { id: '6', title: 'Inception', releaseYear: '2010' },
    { id: '7', title: 'The Matrix', releaseYear: '1999' },
    { id: '8', title: 'Goodfellas', releaseYear: '1990' },
    { id: '9', title: 'The Lord of the Rings', releaseYear: '2001' },
    { id: '10', title: 'Fight Club', releaseYear: '1999' },
  ];

  useEffect(() => {
    // Welcome screen animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    // Show welcome for 2 seconds then load movies
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      fetchMovies();
    }, 2000);

    return () => clearTimeout(welcomeTimer);
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch movies...');
      
      // Try multiple API endpoints
      const apiUrls = [
        'https://reactnative.dev/movies.json'
      ];

      let moviesData = [];
      
      // Try each API endpoint until we get data
      for (let url of apiUrls) {
        try {
          console.log(`Trying API: ${url}`);
          const response = await fetch(url);
          
          if (!response.ok) {
            console.log(`API ${url} failed with status: ${response.status}`);
            continue;
          }
          
          const json = await response.json();
          console.log('Raw API response:', json);
          
          // Handle different API response structures
          if (Array.isArray(json)) {
            // Direct array response (sampleapis.com)
            moviesData = json.slice(0, 10).map((movie, index) => ({
              id: movie.id?.toString() || `fallback-${index}`,
              title: movie.title || 'Unknown Movie',
              releaseYear: movie.year?.toString() || 'Unknown'
            }));
          } else if (json.movies && Array.isArray(json.movies)) {
            // React Native dev API structure
            moviesData = json.movies;
          } else if (json.results && Array.isArray(json.results)) {
            // Another common structure
            moviesData = json.results.slice(0, 10).map((movie, index) => ({
              id: movie.id?.toString() || `fallback-${index}`,
              title: movie.title || movie.name || 'Unknown Movie',
              releaseYear: movie.releaseYear?.toString() || movie.year?.toString() || 'Unknown'
            }));
          }
          
          if (moviesData.length > 0) {
            console.log(`Successfully got ${moviesData.length} movies from ${url}`);
            break;
          }
        } catch (apiError) {
          console.log(`API ${url} error:`, apiError.message);
          continue;
        }
      }

      // If no API worked, use fallback data
      if (moviesData.length === 0) {
        console.log('All APIs failed, using fallback data');
        moviesData = fallbackMovies;
      }

      setData(moviesData);
      console.log('Final movies data:', moviesData);

    } catch (err) {
      console.error('Overall fetch error:', err);
      setError(err.message);
      // Always use fallback data
      setData(fallbackMovies);
    } finally {
      setLoading(false);
    }
  };

  // Welcome Screen Component
  const WelcomeScreen = () => (
    <View style={styles.welcomeContainer}>
      <Animated.View style={[
        styles.welcomeContent,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Text style={styles.welcomeTitle}>🎬</Text>
        <Text style={styles.welcomeTitle}>Welcome to</Text>
        <Text style={styles.appName}>Movies JoyNet</Text>
        <Text style={styles.welcomeSubtitle}>Your ultimate movie companion</Text>
        <ActivityIndicator 
          size="small" 
          color="#9370DB" 
          style={styles.welcomeLoader} 
        />
      </Animated.View>
    </View>
  );

  const renderMovieItem = ({ item, index }) => (
    <View style={styles.movieItem}>
      <View style={styles.movieHeader}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{item.releaseYear}</Text>
        </View>
      </View>
      <Text style={styles.releaseYear}>Released in {item.releaseYear}</Text>
      <View style={styles.movieFooter}>
        <Text style={styles.rating}>⭐ {(Math.random() * 2 + 3).toFixed(1)}</Text>
        <Text style={styles.genre}>🎭 {getRandomGenre()}</Text>
      </View>
    </View>
  );

  // Helper function for random genres
  const getRandomGenre = () => {
    const genres = ['Drama', 'Action', 'Comedy', 'Thriller', 'Sci-Fi', 'Romance', 'Adventure'];
    return genres[Math.floor(Math.random() * genres.length)];
  };

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9370DB" />
        <Text style={styles.loadingText}>Fetching amazing movies...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>🎥 Movies JoyNet</Text>
        <Text style={styles.subHeader}>Discover Amazing Films</Text>
        <Text style={styles.movieCount}>{data.length} movies found</Text>
      </View>
      
      {error && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ Using demo data</Text>
        </View>
      )}
      
      <FlatList
        data={data}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎭</Text>
            <Text style={styles.emptyText}>No movies available</Text>
            <Text style={styles.emptySubtext}>Please check your connection</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Welcome Screen Styles
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#F8F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
    padding: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    color: '#6A5ACD',
    fontWeight: '300',
    marginBottom: 5,
  },
  appName: {
    fontSize: 36,
    color: '#9370DB',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  welcomeLoader: {
    marginTop: 30,
  },

  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  headerContainer: {
    backgroundColor: '#9370DB',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '300',
    marginBottom: 5,
  },
  movieCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontWeight: '300',
  },

  // Warning Banner
  warningBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },

  // List Styles
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  // Movie Item Styles
  movieItem: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 8,
    borderRadius: 15,
    shadowColor: '#9370DB',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#9370DB',
  },
  movieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  yearBadge: {
    backgroundColor: '#E6E6FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
  },
  yearText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9370DB',
    textAlign: 'center',
  },
  releaseYear: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  movieFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rating: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  genre: {
    fontSize: 14,
    color: '#9370DB',
    fontWeight: '500',
  },

  // Loading & Empty States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#9370DB',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});


export default MovieScreen;
