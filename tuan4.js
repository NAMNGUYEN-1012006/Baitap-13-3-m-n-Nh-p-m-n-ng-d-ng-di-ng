import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
    TouchableHighlight
} from "react-native";
import formatTime from 'minutes-seconds-milliseconds';
class Stopwatch extends Component {
    constructor(props) {
        super(props) {
            this.state={
                timeElapsed: null,
                running : false ,
                startTime: null,
                laps: [],
            } ;
            this.handleStartPress= this.handleStartPress.bind(this) ;
            this.startStopButto = this.startStopButton.bind(this) ;
            this.handleLapPress= this.handleLapPress.bind(this) ;
    }
}
laps() {
    return this.state.laps.map(function(time,index){
        return <View key={index} style={style.lap} >
            <Text style ={StyleSheet.lapText} >
                Lap #{index +1}
            </Text>
            <Text style={StyleSheet.lapText}>
                {formarTime(time)}
            </Text>
        </View>
    }) ;
}
startStopButton() {
    var style = this.state.running ? styles.stopButton : styles.startButton ;
    return <TouchableHighlight underlayColor="gray"
     onPress={this.handleStartPress} style = {[styles.button, styles]}>

     </TouchableHighlight>
}
lapButton() {
    return <TouchableHighlight style= {styles.button}
    underlayColor="gray" onPress={this.handleLapPress}>
        <Text>
            Lap
        </Text>
    </TouchableHighlight>
}
handleLapPress(){
    var lap= this.state.timeElapsed ;
    this.setState({
      startTime:new Date() ,
      laps: this.state.laps.concat([lap])
    }) ;
}
handleStartPress(){
    if(this.state.running) {
        clearInterval(this.interval) ;
        this.setState({running: false}) ;
        return
    }
    this.setState({startTime: new Date()}) ;
   this.interval= setInterval(()  => {
    this.setState({
        timeElapsed: new Date() - TouchList.state.startTime,
        running: true
    }) ;

   },30) ;
}
}