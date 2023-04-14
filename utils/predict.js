import axios from 'axios'

export async function predict(userLevel, difficulty){
    const currentDate = new Date(Date.now());
    const response = await axios.post('http://localhost:5000/predict',{value:[userLevel,difficulty]});
    console.log(response.data);
    
    const predictedHours = response.data['prediction'];
    
    //8 hours of working each day from 9:00 to 18:00
    const days = Math.floor(predictedHours / 8);
    const remainderHours = predictedHours % 8;
    
    //add days to current date
    currentDate.setDate(currentDate.getDate()+days);

    //if remainder hours exceed 18:00 add one more day and remaining hours to 9:00
    if((currentDate.getHours()+remainderHours)>18){
        currentDate.setDate(currentDate.getDate()+1);
        currentDate.setHours(currentDate.getHours()+remainderHours-9);
    }
    else{
        currentDate.setHours(currentDate.getHours()+(predictedHours));
    }
    
    return currentDate.toISOString();
}