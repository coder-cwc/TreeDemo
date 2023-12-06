import { defineComponent, nextTick, onMounted, reactive, ref, watch } from "vue";
import axios from "axios";
import clbIcon from "./assets/clb.png";
import listenerIcon from "./assets/listener.png";
import domainIcon from "./assets/domain.png";

export default defineComponent({
  name: "TreeDemo",
  setup() {
    const treeData = reactive([]);
    const loadingRef = ref([]);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log('加载数据');
        }
      });
    });

    const getInitData = async () => {
      const [res1, res2] = await Promise.all([
        axios.get("http://localhost:3000/clb", { params: { _page: 1, _limit: 50 } }),
        axios.get("http://localhost:3000/clb"),
      ]);
      Object.assign(treeData, res1.data.map(item => {
        item.type = "clb";
        item.async = true;
        return item;
      }))
    }

    onMounted(() => {
      getInitData();
    })

    const getRemoteData = async (_item, _callback, _schema) => {
      if (_item.type === 'clb') {
        const [res1, res2] = await Promise.all([
          axios.get(`http://localhost:3000/listener?pid=${_item.id}`, { params: { _page: 1, _limit: 50 } }),
          axios.get(`http://localhost:3000/listener?pid=${_item.id}`)
        ]);
        _item.children = res1.data.map(item => {
          item.type = "listener";
          item.async = true;
          return item;
        });
        if (_item.children.length < res2.data.length) {
          // 插入 loading 节点
          _item.children.push({type: "loading"});
        }
        console.log(loadingRef.value);
      } else if (_item.type === 'listener') {
        const [res1, res2] = await Promise.all([
          axios.get(`http://localhost:3000/domain?pid=${_item.id}`, { params: { _page: 1, _limit: 50 } }),
          axios.get(`http://localhost:3000/domain?pid=${_item.id}`)
        ]);
        _item.children = res1.data.map(item => {
          item.type = "domain";
          item.async = true;
          return item;
        });
        if (_item.children.length < res2.data.length) {
          _item.children.push({type: "loading"});
        }
      }
    }

    return () => (
      <div style={{ width: "500px", height: "100vh" }}>
        <bk-tree
          data={treeData}
          level-line
          label="name"
          children="children"
          async={{
            callback: getRemoteData,
            cache: true,
          }}
        >
          {{
            default: ({ data }) => {
              if (data.type === 'loading') return <bk-loading ref={(ref) => loadingRef.value.push(ref)} loading size="small"><div style={{ height: "36px" }}></div></bk-loading>
              return <div>{data.name}</div>
            },
            nodeType: (node) => {
              switch (node.type) {
                case 'clb': return <img style="padding: 0 10px;" src={clbIcon} alt="" />
                case 'listener': return <img style="padding: 0 10px;" src={listenerIcon} alt="" />
                case 'domain': return <img style="padding: 0 10px;" src={domainIcon} alt="" />
              }
            }
          }}
        </bk-tree>
      </div>
    )
  }
})
