/**
 * 檢查資料庫中的分類資料
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
  console.log('🔍 檢查資料庫中的分類資料...\n');

  // 取得所有分類
  const { data: categories, error } = await supabase
    .from('document_categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ 錯誤:', error);
    return;
  }

  if (!categories || categories.length === 0) {
    console.error('❌ 資料庫中沒有任何分類資料！');
    console.log('\n💡 請執行以下指令來插入標準分類：');
    console.log('   npx supabase db push\n');
    return;
  }

  console.log(`✅ 總共有 ${categories.length} 個分類\n`);

  // 分析主分類與子分類
  const parents = categories.filter(c => c.parent_id === null);
  const children = categories.filter(c => c.parent_id !== null);

  console.log(`📁 主分類數量: ${parents.length}`);
  console.log(`📄 子分類數量: ${children.length}\n`);

  // 顯示每個主分類及其子分類
  console.log('📊 階層結構：\n');
  parents.forEach((parent, index) => {
    const childCount = children.filter(c => c.parent_id === parent.id).length;
    console.log(`${index + 1}. 📁 ${parent.name} (${parent.id})`);
    console.log(`   └─ 子分類數量: ${childCount}`);

    const parentChildren = children.filter(c => c.parent_id === parent.id);
    parentChildren.forEach((child, childIndex) => {
      console.log(`      ${childIndex + 1}. 📄 ${child.name}`);
    });

    console.log('');
  });

  // 檢查孤立的子分類（parent_id 不存在的）
  const orphans = children.filter(child =>
    !parents.some(parent => parent.id === child.parent_id)
  );

  if (orphans.length > 0) {
    console.log(`⚠️  發現 ${orphans.length} 個孤立的子分類（parent_id 無效）：`);
    orphans.forEach(orphan => {
      console.log(`   - ${orphan.name} (parent_id: ${orphan.parent_id})`);
    });
  }

  // 檢查沒有子分類的主分類
  const parentsWithoutChildren = parents.filter(parent =>
    !children.some(child => child.parent_id === parent.id)
  );

  if (parentsWithoutChildren.length > 0) {
    console.log(`\n⚠️  以下主分類沒有子分類：`);
    parentsWithoutChildren.forEach(parent => {
      console.log(`   - ${parent.name}`);
    });
  }
}

checkCategories();
