import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePlantCare } from '../context/PlantCareContext';

const C = { bg:'#FBF9F4', white:'#FFFFFF', low:'#F5F3EE', text:'#1B1C19', muted:'#41493F', outline:'#72796E', variant:'#C1C9BC', green:'#2C5F2D', dark:'#134718', sage:'#C3EBB0' };

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = usePlantCare();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Check your email', 'Enter a valid email address.');
      return;
    }
    if (password.trim().length < 4) {
      Alert.alert('Password required', 'Enter at least 4 characters for this demo.');
      return;
    }
    setLoading(true);
    signIn(email.trim());
    setTimeout(() => {
      setLoading(false);
      router.replace('/home');
    }, 350);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.glow} />
          <View style={s.brand}>
            <View style={s.logo}><Text style={{fontSize:43}}>🌱</Text></View>
            <Text style={s.brandName}>PlantCare</Text>
            <Text style={s.headline}>Healthy Plants, Happy You.</Text>
            <Text style={s.description}>Nurture your indoor jungle with gentle, mindful care rituals.</Text>
          </View>

          <View style={s.card}>
            <Text style={s.label}>Email Address</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="you@sanctuary.com" placeholderTextColor={C.variant} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={s.input} returnKeyType="next" />

            <View style={s.passwordHead}>
              <Text style={s.label}>Password</Text>
              <Pressable onPress={() => router.push('/forgot-password')}><Text style={s.linkSmall}>Forgot password?</Text></Pressable>
            </View>
            <View style={s.passwordRow}>
              <TextInput value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor={C.variant} secureTextEntry={!showPassword} autoCapitalize="none" style={[s.input,{flex:1,marginBottom:0,borderWidth:0}]} onSubmitEditing={handleLogin} />
              <Pressable onPress={() => setShowPassword(v => !v)} style={s.showBtn}><Text style={s.showText}>{showPassword ? 'Hide' : 'Show'}</Text></Pressable>
            </View>

            <Pressable onPress={handleLogin} disabled={loading} style={({pressed}) => [s.primary, pressed && {opacity:.82}]}>
              <Text style={s.primaryText}>{loading ? 'Signing in…' : 'Sign In'}</Text><Text style={s.arrow}>→</Text>
            </Pressable>

            <View style={s.orRow}><View style={s.line}/><Text style={s.or}>OR CONTINUE WITH</Text><View style={s.line}/></View>
            <Pressable style={s.social} onPress={() => Alert.alert('Google sign-in', 'Connect Google authentication to enable this feature.')}><Text style={s.google}>G</Text><Text style={s.socialText}>Continue with Google</Text></Pressable>
            <Pressable style={s.social} onPress={() => Alert.alert('Apple sign-in', 'Connect Apple authentication to enable this feature.')}><Text style={s.apple}>●</Text><Text style={s.socialText}>Continue with Apple</Text></Pressable>
          </View>

          <View style={s.quote}><Text>💧  Take a breath. Your monstera misses you.</Text></View>
          <View style={s.signupRow}><Text style={{color:C.muted}}>Don't have an account?</Text><Pressable onPress={() => router.push('/signup')}><Text style={s.signup}> Sign up ›</Text></Pressable></View>
          <Text style={s.demo}>Demo mode · any valid email and password with 4+ characters</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg}, page:{flexGrow:1,width:'100%',maxWidth:520,alignSelf:'center',paddingHorizontal:22,paddingBottom:28,justifyContent:'center',overflow:'hidden'},
  glow:{position:'absolute',width:240,height:240,borderRadius:120,top:-80,right:-100,backgroundColor:C.sage,opacity:.35},
  brand:{alignItems:'center',paddingTop:18,paddingBottom:24}, logo:{width:90,height:90,borderRadius:45,backgroundColor:'#E5F2E1',alignItems:'center',justifyContent:'center',borderWidth:7,borderColor:C.white}, brandName:{fontSize:32,fontWeight:'700',color:C.dark,marginTop:10}, headline:{fontSize:17,fontWeight:'600',color:C.green,marginTop:4}, description:{fontSize:13,lineHeight:20,color:C.muted,textAlign:'center',maxWidth:285,marginTop:6},
  card:{backgroundColor:C.white,borderRadius:18,padding:22,elevation:3,shadowColor:'#2C281E',shadowOpacity:.07,shadowRadius:15,shadowOffset:{width:0,height:4}},
  label:{fontSize:12,fontWeight:'600',color:C.muted,marginBottom:7}, input:{height:49,backgroundColor:C.low,borderRadius:9,paddingHorizontal:14,color:C.text,fontSize:14,marginBottom:18,borderWidth:1,borderColor:'transparent'},
  passwordHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}, linkSmall:{fontSize:11,color:C.green,fontWeight:'600',marginBottom:7}, passwordRow:{flexDirection:'row',alignItems:'center',backgroundColor:C.low,borderRadius:9,marginBottom:18}, showBtn:{paddingHorizontal:13,paddingVertical:12},showText:{fontSize:12,color:C.green,fontWeight:'600'},
  primary:{height:50,borderRadius:28,backgroundColor:C.green,flexDirection:'row',alignItems:'center',justifyContent:'center'}, primaryText:{color:C.white,fontWeight:'700',fontSize:14},arrow:{color:C.white,fontSize:20,marginLeft:10,marginTop:-2},
  orRow:{flexDirection:'row',alignItems:'center',gap:9,marginVertical:23},line:{height:1,backgroundColor:'#E4E2DD',flex:1},or:{fontSize:9,letterSpacing:1,color:C.outline,fontWeight:'600'},
  social:{height:48,borderRadius:26,backgroundColor:C.low,flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:10},google:{fontSize:19,fontWeight:'800',color:'#4285F4',marginRight:10},apple:{fontSize:17,color:C.text,marginRight:10},socialText:{fontSize:13,fontWeight:'600',color:C.text},
  quote:{alignSelf:'center',backgroundColor:C.low,borderRadius:25,paddingHorizontal:15,paddingVertical:10,marginTop:20}, signupRow:{flexDirection:'row',justifyContent:'center',alignItems:'center',marginTop:24},signup:{color:C.green,fontWeight:'700'},demo:{fontSize:10,color:C.outline,textAlign:'center',marginTop:16}
});
