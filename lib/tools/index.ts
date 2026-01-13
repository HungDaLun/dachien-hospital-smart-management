import { search_knowledge } from './definitions/knowledge';
import { query_business_data } from './definitions/data';
import { send_email, send_notification } from './definitions/communication';
import { export_csv } from './definitions/export';
import { generate_chart } from './definitions/visualization';
import { create_task, summarize_document } from './definitions/productivity';
import { calculate_statistics, web_search } from './definitions/analysis';

export const AVAILABLE_TOOLS = {
    search_knowledge,
    query_business_data,
    send_email,
    send_notification,
    export_csv,
    generate_chart,
    create_task,
    summarize_document,
    calculate_statistics,
    web_search
};
