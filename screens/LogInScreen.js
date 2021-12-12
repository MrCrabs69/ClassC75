import React from 'react';
import { StyleSheet, Text, View, TextInput, Image,KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import  firebase from "firebase"
import db from "../config.js"

export default class LoginScreen extends React.Component{
    constructor(){
        super()
        this.state={
            emailId:'',
            password:''
        }
    }
    login=async(email,password)=>{
        if(email&&password){
            try{
                const response=await firebase.auth().signInWithEmailAndPassword(email,password)
                if(response){
                    this.props.navigation.navigate('Transaction')
                }
            }
            catch(error){
                switch (error.code) {
                    case 'auth/user-not-found':
                        Alert.alert("user does not exist")
                        break;
                    case 'auth/invalid-email':
                        Alert.alert("incorrect Email or Password")
                        break;                

                }
            }
        }
        else{
            Alert.alert('Enter Email and Password')
        }
    }
    render(){
        return(
            <KeyboardAvoidingView style={{alignItems:'center',marginTop:20}}>
                <View>
                    <Image style={{width:200, height:200}} source={require('../assets/booklogo.jpg')}/>
                    <Text style={{textAlign:'center', fontSize:30}}>
                        Wily
                    </Text>
                </View>
                <View>
                    <TextInput style={styles.loginBox} placeholder="ABC@example.com" keyboardType="email-address"
                    onChangeText={(text)=>{
                        this.setState({
                            emailId:text
                        })
                    }}/>
                    <TextInput style={styles.loginBox} placeholder="Enter Password" secureTextEntry={true}
                    onChangeText={(text)=>{
                        this.setState({
                            password:text
                        })
                    }}/>
                </View>
                <View>
                    <TouchableOpacity style={styles.button} onPress={()=>{this.login(this.state.emailId,this.state.password)}}>
                        <Text style={{textAlign:"center"}}>
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

const styles=StyleSheet.create({
    loginBox:{
        width:300,height:40,borderWidth:1.5,fontSize:20,margin:10,paddingLeft:10
    },
    button:{
        height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:7
    }
})