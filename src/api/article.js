import request from './request'

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @param {Number} params.category_id - 一级分类ID（1:新闻动态, 2:通知公告）
 * @param {Number} params.sub_category_id - 二级分类ID
 * @param {Number} params.page - 页码
 * @param {Number} params.pageSize - 每页数量
 */
export const getArticleList = (params) => {
  return request({
    url: '/articles',
    method: 'get',
    params
  })
}

/**
 * 根据一级分类获取文章
 */
export const getArticlesByCategory = (categoryId, limit = 10) => {
  return request({
    url: '/articles',
    method: 'get',
    params: {
      category_id: categoryId,
      page: 1,
      pageSize: limit
    }
  })
}

/**
 * 根据二级分类获取文章
 */
export const getArticlesBySubCategory = (subCategoryId, page = 1, pageSize = 10) => {
  return request({
    url: '/articles',
    method: 'get',
    params: {
      sub_category_id: subCategoryId,
      page,
      pageSize
    }
  })
}

/**
 * 获取文章详情
 */
export const getArticleDetail = (id) => {
  return request({
    url: `/articles/${id}`,
    method: 'get'
  })
}
