import React from "react";
import ReactDOM from "react-dom";
import HomeMap from "./Map";
import "./Index.css"
import 'leaflet/dist/leaflet.css';


ReactDOM.render(
  <HomeMap/>,
  document.getElementById('root'),
);

// class Clock extends React.Component{ // accepts a single props (property), and returns and Element. Basic function component.
//   constructor(props){
//     super(props);
//     this.state = {date: new Date()};
//   }
//   // lifecycle methods with a dash of async for you.
//   componentDidMount(){
//     this.timerID = setInterval(
//       ()=>this.tick(),
//       1000
//     );
//   }
//   componentWillUnmount(){
//     clearInterval(this.timerID);
//   }

//   // tick, which componentDidMount will run every second
//   tick(){
//     this.setState({
//       date: new Date()
//     });
//   }

//   render(){
//     return(
//       <div>
//         <h2>The time is now {this.state.date.toLocaleTimeString()}.</h2>
//       </div>
//     );    
//   }
// }
// const element = <Welcome name="Sarah"/>;

// ReactDOM.render(
//   <Map/>,
//   document.getElementById('root'),
// );
