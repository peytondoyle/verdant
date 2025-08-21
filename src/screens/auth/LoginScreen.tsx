import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, loginWithSms } = useAuth();

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      await loginWithEmail(email);
      Alert.alert('Check your email', 'A magic link has been sent to your email address.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSmsLogin = async () => {
    setLoading(true);
    try {
      await loginWithSms(phone);
      Alert.alert('Check your phone', 'An OTP has been sent to your phone number.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Login with Email" onPress={handleEmailLogin} disabled={loading} />

      <Text style={styles.orText}>OR</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone Number (e.g., +15551234567)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />
      <Button title="Login with SMS" onPress={handleSmsLogin} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  orText: {
    marginVertical: 20,
    fontSize: 18,
  },
});

export default LoginScreen;
