import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import SearchScreen from './screens/SearchScreen';
import BookTransactionScreen from './screens/BookTransactionScreen';
import {createAppContainer} from 'react-navigation'
import {createBottomTabNavigator} from 'react-navigation-tabs'


export default function App() {
  return (
<AppContainer/>
  );
}
const TabNavigator=createBottomTabNavigator({
  Transaction:{screen:BookTransactionScreen},
  Search:{screen:SearchScreen}
},{
  defaultNavigationOptions:({navigation})=>({
    tabBarIcon:()=>{
      const routeName = navigation.state.routeName 
      if(routeName==="Transaction"){
        return(
          <Image source={require("./assets/book.png")} style={{width:35, height:35}}/>
        )
      }
      else if(routeName==="Search"){
        return(
          <Image source={require("./assets/searchingbook.png")} style={{width:35, height:35}}/>
        )
      }
      
    }
  })
})
const AppContainer = createAppContainer(TabNavigator)