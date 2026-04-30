package com.bloger.backend.service.impl;

import com.bloger.backend.entity.Tag;
import com.bloger.backend.exception.BusinessException;
import com.bloger.backend.mapper.ArticleTagMapper;
import com.bloger.backend.mapper.TagMapper;
import com.bloger.backend.service.TagService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class TagServiceImpl implements TagService {

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Override
    public Tag getById(Long id) {
        return tagMapper.selectById(id);
    }

    @Override
    public List<Tag> list() {
        return tagMapper.selectList();
    }

    @Override
    public List<Tag> listByArticleId(Long articleId) {
        return tagMapper.selectByArticleId(articleId);
    }

    @Override
    public List<Tag> searchByName(String name) {
        return tagMapper.searchByName(name);
    }

    @Override
    public Tag save(Tag tag) {
        Integer maxSort = tagMapper.selectMaxSort();
        tag.setSort(maxSort == null ? 1 : maxSort + 1);
        tagMapper.insert(tag);
        return tag;
    }

    @Override
    public void update(Tag tag) {
        tagMapper.update(tag);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new BusinessException(404, "标签不存在");
        }

        long count = articleTagMapper.countByTagId(id);
        if (count > 0) {
            throw new BusinessException(400, "该标签下有 " + count + " 篇文章，不能删除");
        }

        tagMapper.delete(id);
    }
}