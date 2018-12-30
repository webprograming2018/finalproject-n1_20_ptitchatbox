import { Bar } from "vue-chartjs";

export default {
  extends: Bar,
  props: ['datasets'],
  mounted() {

    const _d = {
      labels: ["Chocolate", "Vanilla", "Strawberry","test","Chocolate", "Vanilla", "Strawberry","test","Chocolate", "Vanilla", "Strawberry"],
      datasets: [
        {
          label: "Mon1",
          backgroundColor: "blue",
          data: [500,100,300, 700, 400,300,200,100,500,400,253,203,201]
        },
        {
          label: "Mon2",
          backgroundColor: "red",
          data: [400, 300, 500]
        },
        {
          label: "Groucho",
          backgroundColor: "green",
          data: [700, 211, 600]
        }
      ]
    }
    this.renderChart(
      this.datasets,
      {
        responsive: true,
        maintainAspectRatio: false,
        barValueSpacing: 20,
        scales: {
          yAxes: [
            {
              ticks: {
                min: 0
              }
            }
          ]
        }
      }
    );
  },
  watch:{
    datasets:function(val){

      this.renderChart(
        this.datasets,
        {
          responsive: true,
          maintainAspectRatio: false,
          barValueSpacing: 20,
          scales: {
            yAxes: [
              {
                ticks: {
                  min: 0
                }
              }
            ]
          }
        }
      );
    }
  }
};
