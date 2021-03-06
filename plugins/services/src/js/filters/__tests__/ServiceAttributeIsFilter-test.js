var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var ServiceStatus = require("../../constants/ServiceStatus");
var ServiceAttributeIsFilter = require("../ServiceAttributeIsFilter");
var List = require("#SRC/js/structs/List");

describe("ServiceAttributeIsFilter", function() {
  beforeEach(function() {
    this.mockItems = [
      {
        getServiceStatus() {
          return ServiceStatus.DELAYED;
        }
      },
      {
        getServiceStatus() {
          return ServiceStatus.DEPLOYING;
        }
      },
      {
        getServiceStatus() {
          return ServiceStatus.RUNNING;
        }
      },
      {
        getServiceStatus() {
          return ServiceStatus.STOPPED;
        }
      },
      {
        getServiceStatus() {
          return ServiceStatus.WAITING;
        }
      },
      {
        getServiceStatus() {
          return ServiceStatus.NA;
        }
      }
    ];
  });

  it("Should correctly keep services in delayed state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:delayed");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });

  it("Should correctly keep services in deploying state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:deploying");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[1]
    ]);
  });

  it("Should correctly keep services in running state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:running");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[2]
    ]);
  });

  it("Should correctly keep services in stopped state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:stopped");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[3]
    ]);
  });

  it("Should correctly keep services in waiting state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:waiting");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[4]
    ]);
  });

  it("Should correctly keep services in n/a state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:na");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[5]
    ]);
  });

  it("Should correctly keep nothing on unknown states", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("Should be case-insensitive", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:dElAyED");

    const filters = new DSLFilterList([new ServiceAttributeIsFilter()]);

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });
});
