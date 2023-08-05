import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import api from "../json-server/api";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import SpinnerLoading from "../components/SpinnerLoading";
import { useFormik } from "formik";

export const SearchPage = ({ users_map, events_map, events }) => {
  const navigate = useNavigate();
  const { searchkey } = useParams();
  const [filtered, setFiltered] = useState([]);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [location, setLocation] = useState([]);
  const [category, setCategory] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const [value, setValue] = useState({});
  const formik = useFormik({
    initialValues: {
      searchform: "",
      startdate: "",
      completed_event: false,
      enddate: "",
      location: [],
      category: [],
    },
    onSubmit: (values) => {
      console.log(`aaa`, values.searchform);
      setValue(values);
    },
  });

  const updatefilter = async () => {
    console.log(`1`, value);
    const filter_hashmap = new Set();
    const new_filtered = [];
    let temp = [...filtered];

    console.log(2, temp);
    if (value.searchform) {
      console.log(value.searchform);
      const res = await api.get(`events?q=${value.searchform}`);
      temp = [...res.data];
      console.log(temp);
    } else {
      const res = await api.get(`events`);
      temp = [...res.data];
    }
    console.log(3, temp);
    if (value.startdate && !value.completed_event) {
      value["date-start"] = today;
    }
    if (value.startdate) {
      temp = temp.filter((val) => val["date-start"] > value.startdate);
      console.log(temp);
    }
    console.log(4, temp);
    if (value.enddate) {
      temp = temp.filter((val) => val["date-end"] <= value.enddate);
      console.log(temp);
    }
    console.log(5, temp);
    try {
      if (value?.location.length) {
        for (let i of value.location) {
          for (let item of temp) {
            if (item.location == i) {
              filter_hashmap.add(item.id);
            }
          }
        }
      }
      console.log(6, temp);
      console.log(7, filter_hashmap);
      if (value?.category.length) {
        for (let i of value.category) {
          for (let item of temp) {
            if (item.category == i) {
              filter_hashmap.add(item.id);
            }
          }
        }
      }
      console.log(8, filter_hashmap);
      console.log("events_map", events_map);
      if (!value?.location.length && !value?.category.length) {
        for (let item of temp) filter_hashmap.add(item.id);
      }

      for (let id of filter_hashmap) {
        new_filtered.push(events_map.get(id));
      }

      console.log(9, new_filtered);
      setFiltered(new_filtered);
    } catch (err) {
      console.log(err);
    }
  };

  async function fetchEvents() {
    const temp_location = new Set();
    const temp_category = new Set();
    events.forEach((any_event) => {
      temp_location.add(any_event.location);
      temp_category.add(any_event.category);
    });
    setLocation(Array.from(temp_location));
    setCategory(Array.from(temp_category));
    if (searchkey) {
      const res = await api.get(`events?${searchkey}`);
      const temp_filter = res.data.filter(
        (thisevent) => thisevent["date-start"] > today
      );
      setFiltered([...temp_filter]);
    } else {
      const res = await api.get(`events`);
      const temp_filter = res.data.filter(
        (thisevent) => thisevent["date-start"] > today
      );
      setFiltered([...temp_filter]);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);
  useEffect(() => {
    fetchEvents();
  }, [searchkey]);

  console.log(formik.values);

  useEffect(() => {
    updatefilter();
  }, [value]);

  return (
    <>
      <Row>
        <Col lg={2} className="vh-100 mt-2" id="side-bar">
          <Row>
            <Button
              variant="primary"
              className="d-lg-none"
              onClick={handleShow}
            >
              Detailed Search Menu
            </Button>
          </Row>

          <Offcanvas
            show={show}
            onHide={handleClose}
            responsive="lg"
            className="bg-secondary p-2"
            style={{ borderRadius: "15px" }}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Detailed Search</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body
              className="d-flex flex-column justify-content-between"
              style={{ gap: "10px", minWidth: "132px" }}
            >
              <Row>
                <h5>Detailed Search</h5>
              </Row>
              <Row>
                <Form className="d-flex">
                  <Form.Control
                    id="searchform"
                    name="searchform"
                    type="search"
                    placeholder="Search"
                    className="me-2"
                    aria-label="Search"
                    onKeyPress={(e) =>
                      formik.setFieldValue(e.target.name, e.target.value)
                    }
                  />
                  <Button
                    xl={1}
                    variant="primary"
                    onClick={formik.handleSubmit}
                  >
                    Find
                  </Button>
                </Form>
              </Row>
              <Row>
                <label>
                  <input
                    type="checkbox"
                    name="completed_event"
                    value="completed_event"
                    onChange={formik.handleChange}
                  />
                  Include previous events?
                </label>
              </Row>
              <Row>
                <h6>Date start</h6>
                <Form.Group controlId="startdate">
                  <Form.Control
                    type="date"
                    name="startdate"
                    placeholder="Start date"
                    onChange={formik.handleChange}
                  />
                </Form.Group>
              </Row>
              <Row>
                <h6>Date end</h6>
                <Form.Group controlId="enddate">
                  <Form.Control
                    type="date"
                    name="enddate"
                    placeholder="End date"
                    onChange={formik.handleChange}
                  />
                </Form.Group>
              </Row>

              <Row
                className="d-flex flex-column flex-nowrap"
                style={{
                  maxHeight: "25vh",
                  maxWidth: "100%",
                  overflowY: "scroll !important",
                  overflowX: "hidden",
                }}
              >
                <h6>Location</h6>
                {location?.length ? (
                  location.map((any_location, index) => (
                    <label key={index}>
                      <input
                        type="checkbox"
                        name="location"
                        value={any_location}
                        onChange={formik.handleChange}
                      />
                      {any_location}
                    </label>
                  ))
                ) : (
                  <SpinnerLoading />
                )}
              </Row>
              <Row
                className="d-flex flex-column flex-nowrap"
                style={{
                  maxHeight: "25vh",
                  maxWidth: "100%",
                  overflowY: "scroll !important",
                  overflowX: "hidden",
                }}
              >
                <h6>Categories</h6>
                {category?.length ? (
                  category.map((any_category, index) => (
                    <label key={index}>
                      <input
                        type="checkbox"
                        name="category"
                        value={any_category}
                        onChange={formik.handleChange}
                      />
                      {any_category}
                    </label>
                  ))
                ) : (
                  <SpinnerLoading />
                )}
              </Row>
            </Offcanvas.Body>
          </Offcanvas>
        </Col>
        <Col>
          <Container>
            <Row>
              {filtered[0] &&
                filtered.map((this_event, index) => (
                  <Col
                    md={6}
                    lg={4}
                    xl={3}
                    className="my-2 d-flex justify-content-center col-card"
                    key={index}
                    type="button"
                    onClick={() =>
                      navigate(`/${this_event.id}/${this_event.name}`)
                    }
                  >
                    <Card style={{ width: "18rem" }}>
                      <Card.Img
                        variant="top"
                        referrerPolicy="no-referrer"
                        src={this_event.photo[0]}
                        alt={this_event.name}
                        className="image-event"
                      />
                      <Card.Body>
                        <Card.Title className="event-name">
                          {this_event.name}
                        </Card.Title>
                        <Card.Text className="location">
                          {this_event.location}
                        </Card.Text>
                        <Card.Text className="date">
                          {new Date(this_event["date-start"])
                            .toString()
                            .slice(0, 15)}
                        </Card.Text>
                        <Card.Text className="description">
                          {this_event.description}
                        </Card.Text>
                        <Button variant="primary">Reserve Ticket</Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Container>
        </Col>
      </Row>
    </>
  );
};
