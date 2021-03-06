<template>
  <div style="width: 50rem;">
    <h1>My Visitors</h1>
    <div style="display: flex;">
      <template v-if="$apollo.loading"><a-skeleton active/></template>
      <template v-else>
        <div v-if="seminarsBySelectedSemester.length">
          <SeminarsWithVisitsCard
            v-for="seminar in seminarsBySelectedSemester"
            :seminar="seminar"
            :key="seminar.id"
          />
        </div>
        <div v-else>
          <div style="width: 35rem;">
            <a-card hoverable>
              <p>You have no upcoming visitors</p>
            </a-card>
          </div>
        </div>
        <div style="position: sticky; top: 20px; margin: 0 20px;">
          <a-card style="width: 15rem;">
            <h4>Visits by semester</h4>
            <a-menu v-model="selectedSemester">
              <a-menu-item
                v-for="semester in seminarsGroupBySemester"
                :key="semester.semester_code"
              >
                {{ semester.full_name }}
              </a-menu-item>
            </a-menu>
          </a-card>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import SeminarsWithVisitsCard from "./SeminarWithVisitsCard";
import queries from "@/graphql/queries.gql";
import store from "@/store";
// import constants from "@/utils/constants";

export default {
  name: "MyVisitorsPage",
  components: {
    SeminarsWithVisitsCard
  },
  data() {
    return {
      seminarsWithVisits: [],
      selectedSemester: [process.env.VUE_APP_SEMESTER_CODE],
      error: ""
    };
  },
  apollo: {
    semesterNames: {
      query: queries.get_semester_names,
      update: data => data.semester,
      error(err) {
        this.error = err;
      }
    },
    seminarsWithVisits: {
      query: queries.get_seminars_with_visits_by_time_requested,
      variables() {
        return {
          faculty_id: store.state.loggedInUser
          // semester_code: process.env.VUE_APP_SEMESTER_CODE
        };
      },
      update: data => data.seminar,
      fetchPolicy: "network-only",
      error(err) {
        this.error = err;
      }
    }
  },
  computed: {
    semesterNamesMap() {
      const m = {};
      if (!this.semesterNames) return {};
      this.semesterNames.forEach(
        semester => (m[semester.code] = semester.full_name)
      );
      return m;
    },
    seminarsWithSomeVisits() {
      return this.seminarsWithVisits.filter(
        seminar => Array.isArray(seminar.visits) && seminar.visits.length
      );
    },
    seminarsGroupBySemester() {
      const defaultVal = [
        {
          semester_code: process.env.VUE_APP_SEMESTER_CODE,
          seminars: [],
          full_name: this.semesterNamesMap[process.env.VUE_APP_SEMESTER_CODE]
        }
      ];
      if (!this.seminarsWithSomeVisits.length) return defaultVal;
      return this.seminarsWithSomeVisits.reduce((acc, cur) => {
        const cur_semester_code = cur.semester_code;
        const idx =
          acc.length === 0
            ? -1
            : acc.findIndex(
                semesterWithSeminars =>
                  semesterWithSeminars.semester_code === cur_semester_code
              );
        if (idx === -1) {
          acc.push({
            semester_code: cur_semester_code,
            seminars: [cur],
            full_name: cur.semester.full_name
          });
        } else {
          acc[idx].seminars.push(cur);
        }
        return acc;
      }, defaultVal);
    },
    seminarsBySelectedSemester() {
      return this.seminarsGroupBySemester.find(
        semester => semester.semester_code === this.selectedSemester[0]
      ).seminars;
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

<style scoped></style>
