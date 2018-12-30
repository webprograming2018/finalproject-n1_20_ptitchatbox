<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <img v-bind:src="getAvatar" class="img-avatar" alt="admin@bootstrapmaster.com">
    </template>\
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center">
        <strong>Account</strong>
      </b-dropdown-header>
      <!--
      <b-dropdown-item :to="{ name: 'setting' }">
        <i class="fa fa-wrench" /> Settings
      </b-dropdown-item>
      -->
      <b-dropdown-item @click="signOut()">
        <i class="fa fa-lock"/> Logout
      </b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from "@coreui/vue";

export default {
  name: "DefaultHeaderDropdownAccnt",
  components: {
    AppHeaderDropdown
  },
  computed: {
    getAvatar() {
      if (!(this.publicInfo && this.publicInfo.avatar) && !(this.privateInfo &&this.privateInfo.avatar )) {
        return "/img/default-avatar.png";
      } else {
        return this.publicInfo.avatar || this.privateInfo.avatar;
      }
    }
  },
  data: () => {
    return {
      itemsCount: 42,
      publicInfo: null,
      privateInfo:null
    };
  },
  created() {
    const id = this.$store.getters["user/id"];
    this.$bindAsObject("publicInfo", this.$store.state.db.ref("public/" + id));
    const uid = this.$store.getters["user/uid"];
    this.$bindAsObject("privateInfo", this.$store.state.db.ref("public/" + uid));
  },
  methods: {
    signOut: function() {
      return this.$root.signOut();
    }
  }
};
</script>
