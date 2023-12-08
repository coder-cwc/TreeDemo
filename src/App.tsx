import { defineComponent, ref } from "vue";
import DynamicTree from "./components/dynamic-tree";


export default defineComponent({
  name: "TreeDemo",
  setup() {

    const treeData = ref([]);
    const baseUrl = 'http://localhost:3000';

    return () => (
      <DynamicTree v-model:treeData={treeData.value} baseUrl={baseUrl} style={{ width: "500px", height: "100vh" }}></DynamicTree>
    )
  }
})
