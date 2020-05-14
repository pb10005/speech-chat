<template>
  <div class="chat">
    <v-app-bar fixed>
      <div style="flex-basis">
        <v-btn icon @click="$router.push('/')">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </div>
      <v-toolbar-title v-if="this.thread">{{
        this.thread.thread_name
      }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="removeThread">
            <v-list-item-title>このスレッドを削除する</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <section v-if="this.thread">
      <section id="chat-area">
        <Chat />
      </section>
    </section>
  </div>
</template>
<script>
import Chat from "@/components/Chat";
import gql from "graphql-tag";
export default {
  components: {
    Chat
  },
  apollo: {
    thread: {
      query() {
        return gql`
          query {
            thread: threads_by_pk(thread_id: ${this.$route.params.id}) {
              thread_name
              created_date
            }
          }
        `;
      },
      subscribeToMore: {
        document() {
          return gql`
            subscription {
              thread: threads_by_pk(thread_id: ${this.$route.params.id}) {
                thread_name
              }
            }
          `;
        },
        updateQuery(prev, { subscriptionData }) {
          return subscriptionData.data;
        }
      }
    }
  },
  data() {
    return {
      thread: {
        thread_name: ""
      }
    };
  },
  methods: {
    removeThread() {
      this.$apollo
        .mutate({
          mutation: gql`
        mutation RemoveThread {
          delete_chat_messages(where: {thread_id: {_eq: ${this.$route.params.id}}}) {
            returning {
              msg_id
            }
          }
        }
        `
        })
        .then(() => {
          this.$apollo.mutate({
            mutation: gql`
          mutation RemoveThread {
            delete_threads_by_pk(thread_id: ${this.$route.params.id}) {
              thread_id
              thread_name
            }
          }
          `
          });
        });
    }
  }
};
</script>
<style scoped lang="scss">
#chat-area {
  margin-top: 50px;
}
</style>
