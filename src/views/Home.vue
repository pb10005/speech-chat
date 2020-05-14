<template>
  <section>
    <h2>SpeeChat</h2>
    <div class="home"></div>
    <form @submit.prevent="createThread">
      <v-input>
        <v-text-field label="スレッド名" v-model="threadName" required>
          <input slot="append" type="submit" value="作成" />
        </v-text-field>
      </v-input>
    </form>
    <ul>
      <li v-for="item in threads" :key="item.thread_id">
        <router-link :to="'/thread/' + item.thread_id">
          <span>{{ item.thread_name }}</span>
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script>
import gql from "graphql-tag";

export default {
  name: "Home",
  components: {},
  apollo: {
    threads: {
      query: gql`
        query {
          threads(order_by: { created_date: desc }) {
            thread_id
            thread_name
            created_date
          }
        }
      `,
      subscribeToMore: {
        document: gql`
          subscription {
            threads(order_by: { created_date: desc }) {
              thread_id
              thread_name
              created_date
            }
          }
        `,
        updateQuery: (prev, { subscriptionData }) => {
          if (!prev) return subscriptionData.data;
          const prevIds = prev.threads.map(x => x.thread_id);
          const updates = subscriptionData.data.threads.filter(
            x => !prevIds.includes(x.thread_id)
          );

          if (updates.length > 0) {
            let u = new SpeechSynthesisUtterance(
              "A new thread named '" +
                updates[0].thread_name +
                "' has been created."
            );
            u.lang = "en";
            speechSynthesis.speak(u);
          }
          return subscriptionData.data;
        }
      }
    }
  },
  data() {
    return {
      threadName: "",
      threads: []
    };
  },
  methods: {
    createThread() {
      this.$apollo.mutate({
        mutation: gql`mutation CreateThread {
          insert_threads(objects: {thread_name: "${this.threadName}"}) {
            returning {
              thread_id
            }
          }
        }
        `
      });
    }
  }
};
</script>
