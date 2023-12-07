import { defineComponent, ref } from "vue";
import { throttle } from "lodash";

/**
 * 基于 bkui-vue Tree 的动态树，支持滚动加载数据。
 * 
 * 注意点：
 * - 对数据格式有要求，详细见 src/api/db.json 文件
 * - 当前只支持三层树形结构的数据，如果要加层数，改 loadData 方法中的 _depth < num 即可。
 */
export default defineComponent({
  name: "DynamicTree",
  props: ["treeData", "typeIconMap"],
  emits: ["loadData", "loadRootDataByScroll"],
  setup(props, ctx) {
    const loadingRef = ref(null);

    // Intersection Observer 监听器
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 触发 loadingRef 身上的 loadData 自定义事件
          loadingRef.value.$emit("loadData");
        }
      });
    });

    // 因为在标签上使用 data-xxx 会丢失引用，但我需要 data._parent 的引用（因为加载数据时会直接操作该对象），所以这里借用了闭包的特性。
    const handleLoadData = (data, attributes) => {
      if (data._parent) { // 加载下一页的 childrenData
        //1.移除loading节点
        data._parent.children.pop();
        //2.更新分页参数
        data._parent.pageNum++;
        //3.请求下一页数据
        ctx.emit('loadData', data._parent, attributes.fullPath.split("-").length);
      } else { // 加载下一页的 rootData
        ctx.emit('loadRootDataByScroll');
      }
    }

    return () => (
      <div>
        <bk-tree data={props.treeData} label="name" children="children" level-line virtual-render
          onScroll={throttle(() => { loadingRef.value && observer.observe(loadingRef.value.$el); }, 300)}
          async={{ callback: (_item, _callback , _schema) => {
              const _depth = _schema.fullPath.split("-").length;
              ctx.emit("loadData", _item, _depth + 1);
            },
            cache: true,
          }}
        >
          {{
            default: ({ data, attributes }) => {
              if (data.type === 'loading') {
                return (
                  <bk-loading ref={loadingRef} loading size="small" onLoadData={() => {handleLoadData(data, attributes)}}>
                    <div style={{ height: "36px" }}></div>
                  </bk-loading>
                )
              }
              return <div>{data.name}</div>
            },
            nodeType: (node) => {
              return <img src={props.typeIconMap[node.type]} alt="" style="padding: 0 10px;"/>
            }
          }}
        </bk-tree>
      </div>
    )
  }
})
