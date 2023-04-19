import axios from "axios";

export async function predict(userLevel, difficulty) {
  const response = await axios.post("http://127.0.0.1:5000/predict", {
    value: [userLevel, difficulty],
  });

  const predictedHours = response.data["prediction"];
  return predictedHours;
}
