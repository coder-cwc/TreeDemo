import { defineComponent, reactive, ref, onMounted } from "vue";
import DynamicTree from "./components/dynamic-tree";
import axios from "axios";
import clbIcon from "./assets/clb.png";
import listenerIcon from "./assets/listener.png";
import domainIcon from "./assets/domain.png";

export default defineComponent({
  name: "TreeDemo",
  setup() {

    const treeData = reactive([]);
    const rootPageNum = ref(1);

    // 获取 clb 的数据
    const getInitData = async () => {
      const [res1, res2] = await Promise.all([
        axios.get("http://localhost:3000/clb", { params: { _page: rootPageNum.value, _limit: 50 } }),
        axios.get("http://localhost:3000/clb"),
      ]);
      Object.assign(treeData, [...treeData, ...res1.data.map(item => {
        item.async = true;
        // 每个 clb 身上的 pageNum 控制其下 listener 的请求页码
        item.pageNum = 1;
        return item;
      })])
      if(treeData.length < res2.data.length) {
        treeData.push({type: "loading"});
      }
    }

    const hanldeLoadData = async(_item, _depth) => {
      const url = `http://localhost:3000/${_item.subType}`;
      const params = { _page: _item.pageNum, _limit: 50, pid: _item.id };
      const [res1, res2] = await Promise.all([ axios.get(url, {params}), axios.get(url) ]);
      _item.children = [..._item.children, ...res1.data.map(item => {
        item.type = _item.subType;
        if (_depth < 3) {
          // 每个 item 身上的 pageNum 控制其下 subType 的请求页码
          item.async = true;
          item.pageNum = 1;
        }
        return item;
      })];
      if (_item.children.length < res2.data.length) {
        // 插入 loading 节点
        _item.children.push({type: "loading", _parent: _item});
      }
    };

    onMounted(() => {
      getInitData();
    })

    const handlePopTreeData = () => {
      //1.移除loading节点
      treeData.pop();
      //2.更新分页参数
      rootPageNum.value++;
      //3.请求下一页数据
      getInitData();
    }

    const typeIconMap = {
      clb: clbIcon,
      listener: listenerIcon,
      domain: domainIcon
    };

    return () => (
      <DynamicTree treeData={treeData} typeIconMap={typeIconMap} onLoadData={hanldeLoadData} onLoadRootDataByScroll={handlePopTreeData} style={{ width: "500px", height: "100vh" }}></DynamicTree>
    )
  }
})
