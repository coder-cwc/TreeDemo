import { defineComponent, ref } from "vue";
import DynamicTree from "./components/dynamic-tree";
import clbIcon from "@/assets/images/clb.png";
import listenerIcon from "@/assets/images/listener.png";
import domainIcon from "@/assets/images/domain.png";

export default defineComponent({
  name: "TreeDemo",
  setup() {

    const treeData = ref([]);
    const baseUrl = 'http://localhost:3000';
    const rootType = 'clb';

    const typeIconMap = {
      clb: clbIcon,
      listener: listenerIcon,
      domain: domainIcon
    };

    return () => (
      <DynamicTree v-model:treeData={treeData.value} baseUrl={baseUrl} rootType={rootType} typeIconMap={typeIconMap} style={{ width: "500px", height: "100vh" }}></DynamicTree>
    )
  }
})
