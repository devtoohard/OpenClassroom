<template>
  <div>
    <div class="content-block-wrapper">
      <h2>My Statistics</h2>
      <div style="display: flex; margin-bottom: 50px;">
        <a-checkbox v-model="isShowRequestsMade" class="graph-checkbox">
          Requests Made</a-checkbox
        >
        <a-checkbox v-model="isShowCompletedVisits" class="graph-checkbox"
          >Completed Visits</a-checkbox
        >
        <a-checkbox v-model="isShowRequestsReceived" class="graph-checkbox"
          >Requests Received</a-checkbox
        >
        <a-checkbox v-model="isShowHostedVisits" class="graph-checkbox"
          >Hosted Visits</a-checkbox
        >
      </div>
      <!-- <a-spin v-if="$apollo.loading">
          <a-icon
            slot="indicator"
            type="loading"
            style="font-size: 26px; padding-left: 10px"
            spin
          />
        </a-spin> -->
      <div
        v-if="isShowRequestsMade && visit_requests_chart_data.datasets.length"
        class="chart"
      >
        <h3>
          Requests Made
        </h3>
        <LineChart :chart-data="visit_requests_chart_data" />
      </div>
      <div
        v-if="
          isShowCompletedVisits && completed_visits_chart_data.datasets.length
        "
        class="chart"
      >
        <h3>
          Completed Visits
        </h3>
        <LineChart :chart-data="completed_visits_chart_data" />
      </div>
      <div
        v-if="
          isShowRequestsReceived &&
            visit_requests_received_chart_data.datasets.length
        "
        class="chart"
      >
        <h3>
          Requests Received
        </h3>
        <LineChart :chart-data="visit_requests_received_chart_data" />
      </div>
      <div
        v-if="isShowHostedVisits && hosted_visits_chart_data.datasets.length"
        class="chart"
      >
        <h3>
          Hosted Visits
        </h3>
        <LineChart :chart-data="hosted_visits_chart_data" />
      </div>
    </div>
    <div class="content-class-wrapper">
      <!-- <a-spin v-if="$apollo.loading">
        <a-icon
          slot="indicator"
          type="loading"
          style="font-size: 26px; padding-left: 10px"
          spin
        />
      </a-spin> -->
      <h4 style="text-align:center;">Average Statistics</h4>
      <a-table bordered :columns="columns" :data-source="tableData"></a-table>
    </div>
  </div>
</template>

<script>
import queries from "@/graphql/queries.gql";
import queriesViz from "@/graphql/queriesViz.gql";
import store from "@/store";
import moment from "moment";
import LineChart from "./LineChart";

var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const currentMonth = new Date().getMonth();
const labels = months
  .slice(currentMonth - 2)
  .concat(months.slice(0, currentMonth));

const columns = [
  {
    title: "Statistics",
    dataIndex: "date",
    width: "10rem"
  },
  {
    title: "Requests Made",
    dataIndex: "requestsMade"
  },
  {
    title: "Requests Received",
    dataIndex: "requestsReceived"
  },
  {
    title: "Hosted Visits",
    dataIndex: "hostedVisits"
  },
  {
    title: "Completed Visits",
    dataIndex: "completedVisits"
  }
];

const START_END_TIME_QUERY_VAR = {
  start_time: moment()
    .subtract(30, "days")
    .format(),
  end_time: moment().format(),
  start_time2: moment()
    .subtract(60, "days")
    .format(),
  end_time2: moment()
    .subtract(31, "days")
    .format(),
  start_time3: moment()
    .subtract(61, "days")
    .format(),
  end_time3: moment()
    .subtract(90, "days")
    .format()
};

const VISIT_TYPES = ["visit3", "visit2", "visit1"];

const getRatio = (count, sum) => count && sum && (sum / count).toFixed(1);

const getAverage = visits_counts => {
  if (visits_counts) {
    const faculty_requests_count =
      visits_counts.faculty_aggregate.aggregate.count;
    return VISIT_TYPES.map(x =>
      getRatio(faculty_requests_count, visits_counts[x].aggregate.count)
    );
  } else {
    return VISIT_TYPES.map(() => 0);
  }
};

export default {
  name: "userStats",
  components: {
    LineChart
  },
  data() {
    return {
      isShowRequestsMade: true,
      isShowRequestsReceived: false,
      isShowHostedVisits: false,
      isShowCompletedVisits: false,
      faculty: {},
      my_requests: [],
      columns,
      error: ""
    };
  },

  apollo: {
    my_requests: {
      query: queries.get_seminars_with_visits_by_time_requested,
      variables() {
        return {
          faculty_id: store.state.loggedInUser
        };
      },
      update: data => data.seminar,
      error(err) {
        this.error = err;
      }
    },
    number_of_visit_requests_made_by_user: {
      query: queriesViz.get_total_requests_by_user_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          visitor_id: store.state.loggedInUser
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    number_of_visit_requests_received_by_user: {
      query: queriesViz.get_total_requests_received_by_user_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          faculty_id: store.state.loggedInUser
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    number_of_hosted_visits_by_user: {
      query: queriesViz.get_total_hosted_visits_by_user_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          faculty_id: store.state.loggedInUser
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    number_of_completed_visit_requests_made_by_user: {
      query: queriesViz.get_total_completed_visits_by_user_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          visitor_id: store.state.loggedInUser
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    total_number_of_visit_requests_across_all_users: {
      query: queriesViz.get_avg_requests_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "%"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    total_number_of_visit_requests_received_across_all_users: {
      query: queriesViz.get_avg_requests_received_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "%"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    total_number_of_hosted_visits_across_all_users: {
      query: queriesViz.get_avg_hosted_visits_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "%"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    total_number_of_completed_visit_requests_across_all_users: {
      query: queriesViz.get_avg_completed_visits_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "%"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    visit_requests_made_across_division_science: {
      query: queriesViz.get_avg_requests_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Science"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    visit_requests_made_across_division_social_sciences: {
      query: queriesViz.get_avg_requests_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Social Sciences"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    visit_requests_made_across_division_humanities: {
      query: queriesViz.get_avg_requests_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Humanities"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    completed_visit_requests_made_across_division_science: {
      query: queriesViz.get_avg_completed_visits_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Science"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    completed_visit_requests_made_across_division_social_sciences: {
      query: queriesViz.get_avg_completed_visits_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Social Sciences"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    completed_visit_requests_made_across_division_humanities: {
      query: queriesViz.get_avg_completed_visits_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Humanities"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    visit_requests_received_across_division_science: {
      query: queriesViz.get_avg_requests_received_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Science"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    visit_requests_received_across_division_social_sciences: {
      query: queriesViz.get_avg_requests_received_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Social Sciences"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    visit_requests_received_across_division_humanities: {
      query: queriesViz.get_avg_requests_received_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Humanities"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    hosted_visits_across_division_science: {
      query: queriesViz.get_avg_hosted_visits_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Science"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    hosted_visits_across_division_social_sciences: {
      query: queriesViz.get_avg_hosted_visits_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Social Sciences"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    },
    hosted_visits_across_division_humanities: {
      query: queriesViz.get_avg_hosted_visits_by_division_history,
      variables() {
        return {
          ...START_END_TIME_QUERY_VAR,
          division: "Humanities"
        };
      },
      update: data => data,
      error(err) {
        this.error = err;
      }
    }
  },
  computed: {
    number_of_visit_requests() {
      return this.getChartData("visit_requests_made");
    },
    visit_requests_chart_data() {
      return { labels, datasets: this.number_of_visit_requests };
    },
    number_of_visit_requests_received() {
      return this.getChartData("visit_requests_received");
    },
    visit_requests_received_chart_data() {
      return { labels, datasets: this.number_of_visit_requests_received };
    },
    number_of_hosted_visits() {
      return this.getChartData("hosted_visits");
    },
    hosted_visits_chart_data() {
      return { labels, datasets: this.number_of_hosted_visits };
    },
    number_of_completed_visits() {
      return this.getChartData("completed_visit_requests_made");
    },
    completed_visits_chart_data() {
      return { labels, datasets: this.number_of_completed_visits };
    },
    average_visit_requests_made_across_all_users() {
      return getAverage(this.total_number_of_visit_requests_across_all_users);
    },
    average_completed_visit_requests_made_across_all_users() {
      return getAverage(
        this.total_number_of_completed_visit_requests_across_all_users
      );
    },
    average_visit_requests_received_across_all_users() {
      return getAverage(
        this.total_number_of_visit_requests_received_across_all_users
      );
    },
    average_hosted_visits_across_all_users() {
      return getAverage(this.total_number_of_hosted_visits_across_all_users);
    },

    average_visit_requests_made_across_division_science() {
      return getAverage(this.visit_requests_made_across_division_science);
    },
    average_visit_requests_made_across_division_social_sciences() {
      return getAverage(
        this.visit_requests_made_across_division_social_sciences
      );
    },
    average_visit_requests_made_across_division_humanities() {
      return getAverage(this.visit_requests_made_across_division_humanities);
    },
    average_completed_visit_requests_made_across_division_science() {
      return getAverage(
        this.completed_visit_requests_made_across_division_science
      );
    },
    average_completed_visit_requests_made_across_division_social_sciences() {
      return getAverage(
        this.completed_visit_requests_made_across_division_social_sciences
      );
    },
    average_completed_visit_requests_made_across_division_humanities() {
      return getAverage(
        this.completed_visit_requests_made_across_division_humanities
      );
    },
    average_visit_requests_received_across_division_science() {
      return getAverage(this.visit_requests_received_across_division_science);
    },
    average_visit_requests_received_across_division_social_sciences() {
      return getAverage(
        this.visit_requests_received_across_division_social_sciences
      );
    },
    average_visit_requests_received_across_division_humanities() {
      return getAverage(
        this.visit_requests_received_across_division_humanities
      );
    },
    average_hosted_visits_across_division_science() {
      return getAverage(this.hosted_visits_across_division_science);
    },
    average_hosted_visits_across_division_social_sciences() {
      return getAverage(this.hosted_visits_across_division_social_sciences);
    },
    average_hosted_visits_across_division_humanities() {
      return getAverage(this.hosted_visits_across_division_humanities);
    },
    tableData() {
      if (
        this.number_of_visit_requests_made_by_user &&
        this.number_of_visit_requests_received_by_user &&
        this.number_of_completed_visit_requests_made_by_user
      ) {
        return [
          {
            key: 0,
            date: "My Statistics",
            requestsMade: this.number_of_visit_requests_made_by_user.visit1
              .aggregate.count,
            requestsReceived: this.number_of_visit_requests_received_by_user
              .visit1.aggregate.count,
            hostedVisits: this.number_of_hosted_visits_by_user.visit1.aggregate
              .count,
            completedVisits: this
              .number_of_completed_visit_requests_made_by_user.visit1.aggregate
              .count
          },
          {
            key: 1,
            date: "Average Stats Across Division (Science)",
            requestsMade: this
              .average_visit_requests_made_across_division_science[2],
            requestsReceived: this
              .average_visit_requests_received_across_division_science[2],
            hostedVisits: this.average_hosted_visits_across_division_science[2],
            completedVisits: this
              .average_completed_visit_requests_made_across_division_science[2]
          },
          {
            key: 2,
            date: "Average Stats Across Division (Social Sciences)",
            requestsMade: this
              .average_visit_requests_made_across_division_social_sciences[2],
            requestsReceived: this
              .average_visit_requests_received_across_division_social_sciences[2],
            hostedVisits: this
              .average_hosted_visits_across_division_social_sciences[2],
            completedVisits: this
              .average_completed_visit_requests_made_across_division_social_sciences[2]
          },
          {
            key: 3,
            date: "Average Stats Across Division (Humanities)",
            requestsMade: this
              .average_visit_requests_made_across_division_humanities[2],
            requestsReceived: this
              .average_visit_requests_received_across_division_humanities[2],
            hostedVisits: this
              .average_hosted_visits_across_division_humanities[2],
            completedVisits: this
              .average_completed_visit_requests_made_across_division_humanities[2]
          },
          {
            key: 4,
            date: "Average Stats Across All Users",
            requestsMade: this.average_visit_requests_made_across_all_users[2],
            requestsReceived: this
              .average_visit_requests_received_across_all_users[2],
            hostedVisits: this.average_hosted_visits_across_all_users[2],
            completedVisits: this
              .average_completed_visit_requests_made_across_all_users[2]
          }
        ];
      }
      return [];
    }
  },
  methods: {
    getChartData(cat) {
      const user_data_point = this[`number_of_${cat}_by_user`];
      const all_users_data_point = this[`average_${cat}_across_all_users`];
      const science_data_point = this[`average_${cat}_across_division_science`];
      const social_sciences_data_point = this[
        `average_${cat}_across_division_social_sciences`
      ];
      const humanities_data_point = this[
        `average_${cat}_across_division_humanities`
      ];
      if (
        user_data_point &&
        all_users_data_point &&
        science_data_point &&
        social_sciences_data_point &&
        humanities_data_point
      ) {
        return [
          {
            label: "Me",
            data: VISIT_TYPES.map(x =>
              user_data_point[x].aggregate.count.toFixed(2)
            ),
            lineTension: 0,
            fill: false,
            showLine: true,
            borderColor: "#7dcea0"
          },
          {
            label: "All Users",
            backgroundColor: "#f87979",
            data: all_users_data_point,
            lineTension: 0,
            fill: false,
            showLine: true,
            borderColor: "#85C1E9"
          },
          {
            label: "Science Division",
            data: science_data_point,
            lineTension: 0,
            fill: false,
            showLine: true,
            borderColor: "#F8C471"
          },
          {
            label: "Social Sciences Division",
            data: social_sciences_data_point,
            lineTension: 0,
            fill: false,
            showLine: true,
            borderColor: "#73C6B6"
          },
          {
            label: "Humanities Division",
            data: humanities_data_point,
            lineTension: 0,
            fill: false,
            showLine: true,
            borderColor: "#BB8FCE"
          }
        ];
      }
      return [];
    }
  },
  watch: {
    error(err) {
      if (err.gqlError.extensions.code !== "invalid-jwt")
        this.$notification.error({
          message: "Failed to obtain data from database",
          description: err.toString(),
          duration: 0
        });
    }
  }
};
</script>

<style scoped>
.chart {
  margin-bottom: 50px;
}
</style>
