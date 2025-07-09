// スキーマ構造データ
const data = {
  name: "試合に勝つ",
  children: [
    {
      name: "レーン戦を制する",
      children: [
        {
          name: "ウェーブ管理",
          children: [
            { name: "フリーズ" },
            { name: "プッシュ" },
            { name: "リセット" }
          ]
        },
        { name: "トレードのタイミング" }
      ]
    },
    {
      name: "視界を制する",
      children: [
        { name: "ワードの置き方" },
        { name: "トラッキング" },
        { name: "デワードのタイミング" }
      ]
    }
  ]
};

// SVGサイズ
const width = 800;
const height = 600;

// SVG要素を取得
const svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height);

// ツリー構造のレイアウトを定義
const treeLayout = d3.tree().size([height - 100, width - 200]);

// データを階層構造に変換
const root = d3.hierarchy(data);
treeLayout(root);

// リンク（枝）を描画
svg.selectAll(".link")
  .data(root.links())
  .enter()
  .append("path")
  .attr("class", "link")
  .attr("d", d3.linkHorizontal()
    .x(d => d.y + 100)
    .y(d => d.x + 50)
  );

// ノード（円とテキスト）を描画
const node = svg.selectAll(".node")
  .data(root.descendants())
  .enter()
  .append("g")
  .attr("class", "node")
  .attr("transform", d => `translate(${d.y + 100}, ${d.x + 50})`);

node.append("circle")
  .attr("r", 20)
  .attr("fill", "#69b3a2");

node.append("text")
  .attr("dy", 5)
  .attr("x", d => d.children ? -30 : 30)
  .style("text-anchor", d => d.children ? "end" : "start")
  .text(d => d.data.name);









  

  let selectedNode = null;

// ノードクリックで編集モーダル表示
node.on("click", function(event, d) {
  selectedNode = d;
  document.getElementById("nodeInput").value = d.data.name;
  document.getElementById("editModal").style.display = "block";
});

// モーダルを閉じる
function closeModal() {
  document.getElementById("editModal").style.display = "none";
  selectedNode = null;
}

// ノード名を保存して再描画
function saveNode() {
  const newName = document.getElementById("nodeInput").value;
  if (selectedNode) {
    selectedNode.data.name = newName;
    updateTree(); // 再描画
  }
  closeModal();
}

// ツリーを再描画する関数（初回描画と再描画で共通化）
function updateTree() {
  svg.selectAll("*").remove(); // 既存の描画をクリア

  treeLayout(root);

  svg.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
      .x(d => d.y + 100)
      .y(d => d.x + 50)
    );

  const nodeGroup = svg.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y + 100}, ${d.x + 50})`)
    .on("click", function(event, d) {
      selectedNode = d;
      document.getElementById("nodeInput").value = d.data.name;
      document.getElementById("editModal").style.display = "block";
    });

  nodeGroup.append("circle")
    .attr("r", 20)
    .attr("fill", "#69b3a2");

  nodeGroup.append("text")
    .attr("dy", 5)
    .attr("x", d => d.children ? -30 : 30)
    .style("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name);
}

// 初回描画
updateTree();

//ノードの追加
function addChildNode() {
  if (!selectedNode) {
    alert("ノードを選択してください");
    return;
  }

  const newName = prompt("新しいノードの名前を入力してください：");
  if (!newName) return;

  // 子ノード配列がなければ作成
  if (!selectedNode.data.children) {
    selectedNode.data.children = [];
  }

  selectedNode.data.children.push({ name: newName });
  root = d3.hierarchy(root.data); // 階層構造を再構築
  updateTree();
}

//ノードの削除
function deleteNode() {
  if (!selectedNode) {
    alert("ノードを選択してください");
    return;
  }

  if (selectedNode === root) {
    alert("ルートノードは削除できません");
    return;
  }

  const parent = selectedNode.parent;
  const index = parent.data.children.findIndex(child => child.name === selectedNode.data.name);

  if (index !== -1) {
    parent.data.children.splice(index, 1);
    if (parent.data.children.length === 0) {
      delete parent.data.children;
    }
    root = d3.hierarchy(root.data);
    updateTree();
  }
}








//編集データがダウンロードされるように
　function exportJSON() {
  const json = JSON.stringify(root.data, null, 2); // 編集後のデータを取得
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "lol-schema.json";
  a.click();

  URL.revokeObjectURL(url);
}





//選択したファイルのスキーママップが表示されるように
  document.getElementById("fileInput").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      root = d3.hierarchy(jsonData); // 新しいデータで階層構造を再構築
      updateTree(); // 再描画
    } catch (err) {
      alert("JSONの読み込みに失敗しました。形式を確認してください。");
    }
  };
  reader.readAsText(file);
});