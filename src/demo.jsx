import { defineComponent, nextTick, onMounted, reactive, ref, watch } from "vue";
import axios from "axios";
import clbIcon from "./assets/clb.png";
import listenerIcon from "./assets/listener.png";
import domainIcon from "./assets/domain.png";
import { throttle } from "lodash";

export default defineComponent({
  name: "TreeDemo",
  setup() {
    const treeData = reactive([]);
    const loadingRef = ref(null);

    // 最外层 clb 的分页参数
    let clbPageCount = 1;

    // Intersection Observer 监听器
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 触发 loadingRef 身上的 loadData 自定义事件
          loadingRef.value.$emit("loadData");
        }
      });
    });

    // 获取 clb 的数据
    const getInitData = async () => {
      const [res1, res2] = await Promise.all([
        axios.get("http://localhost:3000/clb", { params: { _page: clbPageCount, _limit: 50 } }),
        axios.get("http://localhost:3000/clb"),
      ]);
      Object.assign(treeData, [...treeData, ...res1.data.map(item => {
        item.type = "clb";
        item.async = true;
        // 每个 clb 身上的 pageCount 控制其下 listener 的请求页码
        item.pageCount = 1;
        return item;
      })])
      if(treeData.length < res2.data.length) {
        treeData.push({type: "loading"});
      }
    }

    onMounted(() => {
      getInitData();
    })

    const getRemoteData = async (_item, _callback, _schema) => {
      if (_item.type === 'clb') {
        const [res1, res2] = await Promise.all([
          axios.get(`http://localhost:3000/listener?pid=${_item.id}`, { params: { _page: _item.pageCount, _limit: 50 } }),
          axios.get(`http://localhost:3000/listener?pid=${_item.id}`)
        ]);
        _item.children = [..._item.children, ...res1.data.map(item => {
          item.type = "listener";
          item.async = true;
          // 每个 listener 身上的 pageCount 控制其下 domain 的请求页码
          item.pageCount = 1;
          return item;
        })];
        if (_item.children.length < res2.data.length) {
          // 插入 loading 节点
          _item.children.push({type: "loading", _parent: _item});
        }
      } else if (_item.type === 'listener') {
        const [res1, res2] = await Promise.all([
          axios.get(`http://localhost:3000/domain?pid=${_item.id}`, { params: { _page: _item.pageCount, _limit: 50 } }),
          axios.get(`http://localhost:3000/domain?pid=${_item.id}`)
        ]);
        _item.children = [..._item.children, ...res1.data.map(item => {
          item.type = "domain";
          return item;
        })];
        if (_item.children.length < res2.data.length) {
          _item.children.push({type: "loading", _parent: _item});
        }
      }
    }

    return () => (
      <div style={{ width: "500px", height: "100vh" }}>
        <bk-tree
          onScroll={throttle(() => {
            if (loadingRef.value) {
              // 监听 loadingRef
              observer.observe(loadingRef.value.$el);
            }
          }, 300)}
          data={treeData}
          level-line
          label="name"
          virtual-render
          children="children"
          async={{
            callback: getRemoteData,
            cache: true,
          }}
        >
          {{
            default: ({ data }) => {
              if (data.type === 'loading') {
                return <bk-loading ref={loadingRef} onLoadData={() => {
                    // 因为在标签上使用 data-xxx 会丢失引用，但我需要 data._parent 的引用（因为加载数据时会直接操作该对象），所以这里借用了闭包的特性。
                  if (data._parent) {
                    // 加载下一页的 listener 或 domain
                    //1.移除loading节点
                    data._parent.children.pop();
                    //2.更新分页参数
                    data._parent.pageCount++;
                    //3.请求下一页数据
                    getRemoteData(data._parent);
                  } else {
                    // 加载下一页的 clb
                    treeData.pop();
                    clbPageCount++;
                    getInitData();
                  }
                }} loading size="small"><div style={{ height: "36px" }}></div></bk-loading>
              }
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
