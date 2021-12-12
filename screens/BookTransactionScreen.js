import React from 'react';
import { StyleSheet, Text, View, TextInput, Image,KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import  firebase from "firebase"
import db from "../config.js"

export default class BookTransactionScreen extends React.Component{
    constructor(){
        super()
        this.state = {
            hasCameraPermissions:null,
            scanned: false,
            scannedBookId: '',
            scannedStudentId:'',
            buttonState: 'normal',
            transactionMessage:''
        }
    }

    getCameraPermissions= async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions:status==='granted',
            buttonState:id,
            scanned: false
        })
    }

    handleBarCodeScanned = async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==="BookId"){
            this.setState({
                scanned: true,
                scannedBookId:data,
                buttonState:'normal',
    
            })
        }

        else if(buttonState==="StudentId"){
            this.setState({
                scanned: true,
                scannedStudentId:data,
                buttonState:'normal',
    
            })
        }
    }

    handletransaction=async()=>{
        var transactionType=await this.checkBookEligibillity()
        if(!transactionType){
            Alert.alert("The book does not exsit in the library database")
            this.setState({
                scannedStudentId:'',
                scannedBookId:''
            })
        }

        else if(transactionType==="Issue"){
            var isStudentEligible=await this.checkStudentEligibillityForBookIssue()
            if (isStudentEligible){
                this.initiatebookissue()
                Alert.alert("Book issued to the student.")
            }
        }

        else{
            var isStudentEligible=await this.checkStudentEligibillityForBookReturn()
            if (isStudentEligible){
                this.initiatebookreturn()
                Alert.alert("Book returned to the library.")
            }
        }
    }

    checkBookEligibillity=async()=>{
        const bookRef=await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
        var transactionType=""
        if(bookRef.docs.length==0){
            transactionType=false
        }
        else{
            bookRef.docs.map(()=>{
                var book=doc.data()
                if(book.bookAvailability){
                    transactionType="Issue"
                }
                else{
                    transactionType="Return"
                }
            })
        }

        return transactionType
    }

    checkStudentEligibillityForBookIssue=async()=>{
        const studentRef=await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
        var isStudentEligible=""
        if(studentRef.docs.length==0){
            isStudentEligible=false
            this.setState({
                scannedStudentId:'',
                scannedBookId:''
            })
            Alert.alert("The Student Id Does not exsit in the database")
        }

        else{
            studentRef.docs.map(()=>{
                var student=doc.data()
                if(student.numberOfBooksIssued<2){
                    isStudentEligible=true
                }
                else{
                    isStudentEligible=false
                    this.setState({
                        scannedStudentId:'',
                        scannedBookId:''
                    })
                    Alert.alert("The Student has already issued 2 books")
                }
            })
        }

        return isStudentEligible
    }

    checkStudentEligibillityForBookReturn=async()=>{
        const transactionRef=await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
        var isStudentEligible=""
        transactionRef.docs.map(()=>{
            var lastBookTransaction=doc.data()
            if(lastBookTransaction.studentId===this.state.scannedStudentId){
                isStudentEligible=true
            }

            else{
                isStudentEligible=false
                Alert.alert("The book wasn't issued by this student")
                this.setState({
                    scannedStudentId:"",
                    scannedBookId:""
                })
            }
        })

        return isStudentEligible
    }

    initiatebookissue=async()=>{
        db.collection('transactions').add({
            'studentId':this.state.scannedStudentId,
            "bookId":this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':'issue'
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':false
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        })
    }

    initiatebookreturn=async()=>{
        db.collection('transactions').add({
            'studentId':this.state.scannedStudentId,
            "bookId":this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':'return'
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        })
    }

    render(){
        const hasCameraPermissions=this.state.hasCameraPermissions
        const scanned=this.state.scanned
        const buttonState=this.state.buttonState
        if (buttonState !== 'normal'&& hasCameraPermissions){
            return(
                <BarCodeScanner style={StyleSheet.absoluteFillObject}
                onBarCodeScanned = {scanned? undefined:this.handleBarCodeScanned}/>
            )
        }
        else if(buttonState==='normal'){
        return(
            <KeyboardAvoidingView style={{alignItems:'center',justifyContent:"center",flex:1}} behavior="padding" enabled>  
                <View>
                    <Image source={require('../assets/booklogo.jpg')} style={{width:200,height:200}}/>
                    <Text style={{textAlign:'center',fontSize:30}}>
                        Wily
                    </Text>
                </View>
                <View style={styles.inputView}>
                    <TextInput style={styles.inputBox} placeholder='BookId' onChangeText={(text)=>this.setState({scannedBookId:text})} value={this.state.scannedBookId}/>
                    <TouchableOpacity style ={styles.scanButton} onPress={()=>{this.getCameraPermissions('BookId')}}>
                    <Text style ={styles.buttonText}>
                        Scan
                    </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputView}>
                    <TextInput style={styles.inputBox} placeholder= 'StudentId' onChangeText={(text)=>this.setState({scannedStudentId:text})} value={this.state.scannedStudentId}/>
                    <TouchableOpacity style ={styles.scanButton} onPress={()=>{this.getCameraPermissions('StudentId')}}>
                    <Text style ={styles.buttonText}>
                        Scan
                    </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.submitbutton} onPress={async()=>{
                    await this.handletransaction()
                }}>
                    <Text style={styles.submitbuttontext}>
                        Submit
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>            
        )
        }
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    displayText:{
        fontSize: 15,
        textDecorationLine: 'underline'
    },
    scanButton:{
        backgroundColor: '#2196f3',
        padding: 10,
        margin: 10
    },
    buttonText:{
        fontSize: 20
    },
    inputView:{
        flexDirection:'row',margin:20
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    scanButton:{
        backgroundColor:'#66bb6a', 
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0,
        height:40
    },
    submitbutton:{
        backgroundColor:'#FBC02D',
        weight:100,
        height: 50
    },
    submitbuttontext:{
        padding:10,
        textAlign: 'center',
        fontSize:20,
        fontWeight: 'bold',
        color: "white"
    }
})