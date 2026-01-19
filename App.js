import 'react-native-get-random-values';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, SafeAreaView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useState, useRef, useEffect } from 'react';

// API Configuration
const API_KEY = "AIzaSyDwMi5_wOo73QL48XCtwsSidS0tO7SF0tg";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const { width, height } = Dimensions.get('window');

// Premium Color Palette
const COLORS = {
  primary: '#7F5A83',
  secondary: '#0D324D',
  accent: '#00D2FF',
  background: '#0F2027',
  surface: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.6)',
  userBubble: '#3A1C71',
  aiBubble: '#2C3E50',
};

export default function App() {
  const [messages, setMessages] = useState([
    { id: 0, text: "Hello! I am your AI Assistant. How can I help you today?", sender: 'ai', time: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genPrompt, setGenPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  const scrollViewRef = useRef();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, sender: 'user', time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const result = await model.generateContent(inputText);
      const response = await result.response;
      const text = response.text();
      
      const aiMsg = { id: Date.now() + 1, text: text, sender: 'ai', time: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg = { id: Date.now() + 1, text: "Sorry, I encountered an error. Please try again.", sender: 'ai', time: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const generateProfilePhoto = async () => {
    if (!genPrompt.trim()) return;
    
    setImageLoading(true);
    // Using Pollinations.ai for instant, free, no-auth image generation as a feature
    const encodedPrompt = encodeURIComponent(genPrompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true`; // Adding random param to force refresh if same prompt
    
    // Simulate loading time for effect or wait for image "pre-fetch"
    setTimeout(() => {
        setGeneratedImage(url);
        setImageLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.background, COLORS.secondary]}
        style={styles.background}
      />
      
      {/* Header */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <View>
                <Text style={styles.headerTitle}>AI Nexus</Text>
                <Text style={styles.headerSubtitle}>Powered by Gemini</Text>
            </View>
            <TouchableOpacity style={styles.profileBtn} onPress={() => setShowGenModal(true)}>
                <LinearGradient
                    colors={['#FF0099', '#493240']}
                    style={styles.profileGradient}
                >
                    <Image 
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }} 
                        style={{ width: 24, height: 24 }} 
                        tintColor="white"
                    />
                </LinearGradient>
            </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
            {messages.map((msg) => (
                <View key={msg.id} style={[
                    styles.messageRow, 
                    msg.sender === 'user' ? styles.userRow : styles.aiRow
                ]}>
                    {msg.sender === 'ai' && (
                        <View style={styles.avatar}>
                            <Image 
                                source={require('./assets/ai-avatar.jpg')} 
                                style={{ width: '100%', height: '100%' }}
                            />
                        </View>
                    )}
                    <View style={[
                        styles.bubble, 
                        msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                    ]}>
                        <Text style={styles.messageText}>{msg.text}</Text>
                        <Text style={styles.timeText}>
                            {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
            ))}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.accent} />
                    <Text style={styles.loadingText}>Thinking...</Text>
                </View>
            )}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    multiline
                />
                <TouchableOpacity onPress={sendMessage} disabled={loading || !inputText.trim()}>
                    <LinearGradient
                        colors={[COLORS.accent, '#3A7BD5']}
                        style={styles.sendButton}
                    >
                        <Text style={styles.sendIcon}>→</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>

        {/* Profile Gen Modal */}
        <Modal
            visible={showGenModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowGenModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>AI Avatar Generator</Text>
                        <TouchableOpacity onPress={() => setShowGenModal(false)}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.modalDesc}>Describe your perfect profile picture and let AI create it.</Text>
                    
                    <TextInput
                        style={styles.genInput}
                        placeholder="e.g. Cyberpunk wolf with neon glasses..."
                        placeholderTextColor="#999"
                        value={genPrompt}
                        onChangeText={setGenPrompt}
                    />

                    <TouchableOpacity onPress={generateProfilePhoto} disabled={imageLoading} style={{width: '100%'}}>
                        <LinearGradient
                            colors={['#FF0099', '#493240']}
                            style={styles.genButton}
                        >
                            {imageLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.genBtnText}>Generate Avatar</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {generatedImage && (
                        <View style={styles.resultContainer}>
                            <Image source={{ uri: generatedImage }} style={styles.resultImage} />
                            <Text style={styles.resultLabel}>Tap to save (Coming Soon)</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 5,
  },
  profileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },
  messageRow: {
    marginBottom: 20,
    flexDirection: 'row',
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiRow: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    overflow: 'hidden',
    marginTop: 4,
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bubble: {
    padding: 14,
    borderRadius: 20,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderTopLeftRadius: 4,
  },
  messageText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 22,
  },
  timeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  loadingContainer: {
    marginLeft: 46,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: 'white',
    maxHeight: 100,
    fontSize: 16,
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: 'white',
    fontSize: 20,
    marginTop: -2,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 24,
    marginTop: -5,
  },
  modalDesc: {
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  genInput: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 14,
    color: 'white',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  genButton: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  genBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  resultContainer: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  resultImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: COLORS.accent,
    marginBottom: 10,
  },
  resultLabel: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '500',
  },
});
