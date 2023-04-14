import axios from 'axios'

export async function predict(userLevel, difficulty){
    const currentDate = new Date(Date.now());
    const response = await axios.post('http://localhost:5000/predict',{value:[userLevel,difficulty]});
    console.log(response.data);
    
    const predictedHours = response.data['prediction'];
    
    //const days = Math.floor(predictedHours / 8);
    //const remainder = predictedHours % 8;
    
    //add predicted hours to current date
    currentDate.setHours(currentDate.getHours()+Math.floor(predictedHours));

    return currentDate.toISOString();
}