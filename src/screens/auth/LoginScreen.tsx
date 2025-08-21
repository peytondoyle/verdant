import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const { loginWithEmail, loginWithPhone, verifyPhoneOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneSent, setPhoneSent] = useState(false);

  const handleEmailLogin = async () => {
    try {
      await loginWithEmail(email);
      Alert.alert('Success', 'Magic link sent to your email!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePhoneLogin = async () => {
    try {
      await loginWithPhone(phone);
      setPhoneSent(true);
      Alert.alert('Success', 'OTP sent to your phone!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyPhoneOtp({ phone, token: otp });
      Alert.alert('Success', 'Phone verified!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
      <Button title="Send Magic Link" onPress={handleEmailLogin} />

      <Text style={styles.orText}>- OR -</Text>

      {!phoneSent ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Button title="Send OTP" onPress={handlePhoneLogin} />
        </View>
      ) : (
        <View>
          <TextInput
            style={styles.input}
            placeholder="OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <Button title="Verify OTP" onPress={handleVerifyOtp} />
        </View>
      )}
    </View>
  );
}

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
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  orText: {
    marginVertical: 20,
    fontSize: 16,
  },
});
