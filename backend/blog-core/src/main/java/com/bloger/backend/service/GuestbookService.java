package com.bloger.backend.service;

import com.bloger.backend.entity.Guestbook;
import java.util.List;

public interface GuestbookService {
    List<Guestbook> list();
    List<Guestbook> listByStatus(Integer status);
    List<Guestbook> listAll();
    Guestbook getById(Long id);
    void save(Guestbook guestbook);
    void update(Guestbook guestbook);
    void reply(Long id, String reply);
    void delete(Long id);
    long count();
}