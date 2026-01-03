import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestData() {
  try {
    console.log('🚀 Creating test data for Galaxy Graph...\n');

    // 1. Create test files (Data Layer)
    const { data: files, error: filesError } = await supabase
      .from('files')
      .insert([
        {
          filename: '2025_市場分析報告.pdf',
          mime_type: 'application/pdf',
          gemini_state: 'SYNCED',
          gemini_file_uri: 'test://file1',
          is_active: true,
          uploaded_by: '493339a31-46bc-467b-aa77-d49306e5c0a6'
        },
        {
          filename: '競爭對手研究_Q1.pdf',
          mime_type: 'application/pdf',
          gemini_state: 'SYNCED',
          gemini_file_uri: 'test://file2',
          is_active: true,
          uploaded_by: '493339a31-46bc-467b-aa77-d49306e5c0a6'
        },
        {
          filename: '客戶訪談紀錄_2024.pdf',
          mime_type: 'application/pdf',
          gemini_state: 'SYNCED',
          gemini_file_uri: 'test://file3',
          is_active: true,
          uploaded_by: '493339a31-46bc-467b-aa77-d49306e5c0a6'
        }
      ])
      .select();

    if (filesError) throw filesError;
    console.log(`✅ Created ${files?.length} test files (Data Layer)`);

    // 2. Get framework ID for SWOT
    const { data: framework, error: frameworkError } = await supabase
      .from('knowledge_frameworks')
      .select('id')
      .eq('code', 'swot')
      .single();

    if (frameworkError || !framework) {
      console.error('❌ SWOT framework not found');
      return;
    }

    // 3. Create knowledge instance (Knowledge Layer)
    const { data: instance, error: instanceError } = await supabase
      .from('knowledge_instances')
      .insert({
        framework_id: framework.id,
        title: '品牌重塑策略大綱 - 2025 年度戰略規劃 SWOT 分析',
        data: {
          Strengths: ['強大的品牌認知度', '優質的產品線'],
          Weaknesses: ['市場滲透率不足', '數位化程度低'],
          Opportunities: ['新興市場成長', 'AI 技術應用'],
          Threats: ['競爭對手崛起', '經濟不確定性']
        },
        source_file_ids: files?.map(f => f.id) || [],
        completeness: 0.85,
        confidence: 0.9,
        ai_summary: '基於市場分析、競爭對手研究與客戶訪談，提出 2025 年品牌重塑策略方向。',
        created_by: '493339a31-46bc-467b-aa77-d49306e5c0a6'
      })
      .select();

    if (instanceError) throw instanceError;
    console.log(`✅ Created knowledge instance (Knowledge Layer)`);

    console.log('\n🎉 Test data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Files (Data Layer): ${files?.length}`);
    console.log(`  - Knowledge Instances: ${instance?.length}`);
    console.log(`  - Edges will be auto-generated from source_file_ids`);
    console.log('\n💡 Refresh /dashboard/brain to see the graph!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestData();
