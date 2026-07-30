package com.infosys.labresource.user.Repository;

import com.infosys.labresource.user.entites.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstitutionRepo extends JpaRepository<Institution,Long> {

}
