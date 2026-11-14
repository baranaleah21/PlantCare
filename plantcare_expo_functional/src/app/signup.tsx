import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePlantCare } from '../context/PlantCareContext';

const green='#2C5F2D';
export default function SignUpScreen() {
  const router=useRouter(); const {signIn}=usePlantCare();
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const submit=()=>{if(!name.trim()||!email.trim()||password.length<4){Alert.alert('Complete the form','Enter your name, email, and a password with at least 4 characters.');return;} if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){Alert.alert('Invalid email','Enter a valid email address.');return;} signIn(email.trim());router.replace('/home');};
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
    <Pressable onPress={()=>router.back()}><Text style={s.back}>‹ Back to login</Text></Pressable>
    <Text style={s.logo}>🌱</Text><Text style={s.title}>Join PlantCare</Text><Text style={s.sub}>Start a happier routine for your plants.</Text>
    <View style={s.card}><Text style={s.label}>Your name</Text><TextInput style={s.input} placeholder="Full name" value={name} onChangeText={setName}/>
    <Text style={s.label}>Email address</Text><TextInput style={s.input} placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/>
    <Text style={s.label}>Password</Text><TextInput style={s.input} placeholder="At least 4 characters" value={password} onChangeText={setPassword} secureTextEntry/>
    <Pressable style={s.button} onPress={submit}><Text style={s.buttonText}>Create Account →</Text></Pressable></View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#FBF9F4'},page:{flexGrow:1,padding:24,justifyContent:'center',maxWidth:520,width:'100%',alignSelf:'center'},back:{color:green,fontWeight:'600',marginBottom:35},logo:{fontSize:48,textAlign:'center'},title:{fontSize:30,fontWeight:'700',color:'#134718',textAlign:'center',marginTop:10},sub:{color:'#41493F',textAlign:'center',marginTop:8,marginBottom:25},card:{backgroundColor:'#FFF',padding:22,borderRadius:18,elevation:3},label:{fontSize:12,fontWeight:'600',color:'#41493F',marginBottom:7,marginTop:8},input:{height:48,backgroundColor:'#F5F3EE',borderRadius:9,paddingHorizontal:13,marginBottom:12,color:'#1B1C19'},button:{height:50,backgroundColor:green,borderRadius:28,alignItems:'center',justifyContent:'center',marginTop:12},buttonText:{color:'#FFF',fontWeight:'700'}});
