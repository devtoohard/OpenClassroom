<template>
  <span>
    <a @click="() => (modal2Visible = true)" href="#">
      Set all <a-icon type="edit" />
    </a>
    <a-modal
      v-model="modal2Visible"
      title="Set visitor capacity for all classes"
      centered
      @ok="() => (modal2Visible = false)"
    >
      <template slot="footer">
        <a-button @click="modal2Visible = false">
          Cancel
        </a-button>
        <a-button primary @click="submit" :loading="isLoading">
          Confirm
        </a-button>
      </template>
      <a-select v-model="visitor_capacity" style="width: 120px;">
        <a-select-option
          v-for="option in visitor_capacity_options"
          :key="option"
          :value="option"
        >
          {{ option === -1 ? "Unlimited" : option }}
        </a-select-option>
      </a-select>
    </a-modal>
  </span>
</template>
<script>
import queries from "@/graphql/queries.gql";
const visitor_capacity_options = [1, 2, 3, 4, 5, 6, -1];
export default {
  name: "updateVisitorCapacityBulk",
  data() {
    return {
      id: this.$route.params.id,
      visitor_capacity: 2,
      modal2Visible: false,
      isLoading: false,
      visitor_capacity_options
    };
  },
  methods: {
    async submit() {
      this.isLoading = true;
      const id = this.id;
      const visitor_capacity = this.visitor_capacity;
      try {
        await this.$apollo.mutate({
          mutation: queries.update_visitor_capacity_for_all_seminars,
          variables: {
            course_group_id: id,
            visitor_capacity
          },
          refetchQueries: ["get_seminars_by_course_group"]
        });
        this.visitor_capacity = "";
      } catch (err) {
        this.$notification.error({
          message: "Failed to set visitor capacity",
          description: err.toString()
        });
      }
      this.isLoading = false;
      this.modal2Visible = false;
    }
  }
};
</script>
<style scoped></style>
