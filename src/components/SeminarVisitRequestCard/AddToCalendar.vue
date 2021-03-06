<template>
  <a-dropdown :trigger="['click']">
    <a class="ant-dropdown-link" @click="e => e.preventDefault()" href="#"
      >Export to external calendar</a
    >
    <a-menu slot="overlay">
      <a-menu-item key="0">
        <a :href="googleCalendarLink" target="_blank">Google calendar</a>
      </a-menu-item>
      <a-menu-item key="1">
        <a :href="icsFile">iCalendar</a>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
const ics = require("ics");
export default {
  name: "AddToCalendar",
  props: {
    seminar: {
      type: Object,
      default: null
    },
    isMyVisit: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    course_group() {
      return this.seminar.course_group;
    },
    course() {
      return this.course_group.course;
    },
    visitors() {
      return this.seminar.visits
        ? this.seminar.visits.filter(x => x.visit_status === "ACCEPTED")
        : [];
    },
    googleCalendarLink() {
      const text = `${this.isMyVisit ? "Class visit" : "Visitors"} - ${
        this.course.title
      }`;
      const date = this.seminar.date.replace(/-/g, "");
      const start = this.seminar.start.replace(/:/g, "");
      const end = this.seminar.end.replace(/:/g, "");
      const dates = `${date}T${start}/${date}T${end}`;
      const ctz = "Asia%2FSingapore";
      const location = this.seminar.location.full_name;
      const instructorInfo = `Instructor: ${this.course_group.faculty.name}%0D%0AEmail: ${this.course_group.faculty.email}`;
      const guests = this.isMyVisit
        ? ""
        : this.visitors
            .map(visit => visit.visitor.email)
            .reduce((acc, cur) => `${cur}&add=${acc}`);
      const visitorsList = this.isMyVisit
        ? ""
        : `Visitors: ${this.visitors
            .map(visit => visit.visitor.name)
            .reduce((acc, cur) => `${cur}, ${acc}`)}`;
      const details = `${this.seminar.desc}%0D%0A%0D%0A${
        this.isMyVisit ? instructorInfo : visitorsList
      }`;
      return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&ctz=${ctz}&location=${location}&details=${details}&add=${guests}&trp=false`;
    },
    icsFile() {
      const date = this.seminar.date.split("-");
      const start = date.concat(this.seminar.start.split(":").splice(0, -1));
      const end = date.concat(this.seminar.end.split(":").splice(0, -1));
      const attendees = this.isMyVisit
        ? ""
        : this.visitors.map(visit => {
            return {
              name: visit.visitor.name,
              email: visit.visitor.email
            };
          });
      const event = {
        start,
        end,
        title: `Class visit - ${this.course.title}`,
        description: this.seminar.desc,
        location: this.seminar.location.full_name,
        status: "CONFIRMED",
        organizer: {
          name: this.course_group.faculty.name,
          email: this.course_group.faculty.email
        },
        attendees
      };
      const { error, value } = ics.createEvent(event);
      if (error) {
        this.$notification.error({
          key: `calendar_export_error`,
          message: "Could not export to external calendar",
          description: "Please try again."
        });
      }
      return `data:text/calendar;charset=utf8,${escape(value)}`;
    }
  }
};
</script>
