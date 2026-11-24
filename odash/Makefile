include $(TOPDIR)/rules.mk

PKG_NAME:=odash
PKG_VERSION:=1.0.0
PKG_RELEASE:=1
PKG_LICENSE:=GPL-2.0-only

include $(INCLUDE_DIR)/package.mk

define Package/odash
  SECTION:=net
  CATEGORY:=Network
  TITLE:=oDash - per-site and per-device traffic, device control (nftables + dnsmasq)
  DEPENDS:=+logd +nftables
  PKGARCH:=all
endef

define Package/odash/description
  Counts download/upload per destination IP with nftables set counters
  and maps IPs to sites using dnsmasq query logs.
endef

define Package/odash/conffiles
/etc/config/odash
/etc/odash/groups.conf
endef

define Build/Compile
endef

define Package/odash/install
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,odash))
