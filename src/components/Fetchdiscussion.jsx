import { Button, Card, Form, Spinner } from "react-bootstrap";
import api from "../json-server/api";
import { useEffect, useState } from "react";
import { SVGPlus } from "./svgPlus";

function FetchDiscussion({ eventid, users_map, events_map }) {
  const [discussionscontainer, setDiscussionscontainer] = useState([]);
  const [activitycounter, setActivitycounter] = useState(0);

  const load_discussion = async () => {
    const res_dis = await api.get(`discussions`);
    const thiseventdiscus = [...res_dis.data];
    const temp_fil = thiseventdiscus.filter((rev) => rev.eventid == eventid)[0];
    setDiscussionscontainer(temp_fil);
  };

  useEffect(() => {
    load_discussion();
  }, []);

  useEffect(() => {
    load_discussion();
  }, [activitycounter]);

  if (discussionscontainer) {
    return (
      <>
        {discussionscontainer.question?.length
          ? discussionscontainer.question?.map((disc, index) => (
              <Card key={index} id={`disc-card-${index}`}>
                <div className="px-3">
                  <span className="d-flex flex-row" style={{ gap: "5px" }}>
                    <span className="pt-1">
                      <Card.Img
                        src="https://static.thenounproject.com/png/5034901-200.png"
                        style={{ maxWidth: "20px", maxHeight: "20px" }}
                      />
                    </span>
                    {discussionscontainer.question_id[index] ? (
                      users_map.get(discussionscontainer.question_id[index])
                        ?.username
                    ) : (
                      <Spinner />
                    )}
                  </span>
                </div>
                <Card.Body className="bg-light px-3">
                  {disc}
                  <Button
                    style={{ float: "right", padding: "0" }}
                    variant="secondary"
                    onClick={(e) => addInput(e)}
                  >
                    <SVGPlus identifier={index} />
                  </Button>

                  <div className="ml-3 px-3 pt-1">
                    {discussionscontainer.reply[index]
                      ? discussionscontainer.reply[index].map((val, idx) => (
                          <>
                            <Card className="mb-2">
                              <div
                                className="d-flex flex-row px-3"
                                style={{ gap: "5px" }}
                              >
                                <span className="pt-1">
                                  <Card.Img
                                    src="https://static.thenounproject.com/png/5034901-200.png"
                                    style={{
                                      maxWidth: "20px",
                                      maxHeight: "20px",
                                    }}
                                  />
                                </span>
                                <span>
                                  {
                                    users_map.get(
                                      discussionscontainer.reply_id[index][idx]
                                    )?.username
                                  }
                                </span>
                              </div>
                              <Card.Body className="bg-light pl-3 py-0">
                                {val}
                              </Card.Body>
                            </Card>
                          </>
                        ))
                      : null}
                  </div>
                </Card.Body>
              </Card>
            ))
          : null}
      </>
    );
  } else return <span>This event has no discussion</span>;
}

export default FetchDiscussion;

function addInput(e) {
  console.log(document.getElementById(`svg-plus-${e.target.id.slice(9)}`));
  const disc_container = document.getElementById(
    `disc-card-${e.target.id.slice(9)}`
  );
  //   console.log(disc_container);
  let div = document.createElement("div");
  div.style.cssText = "display:flex; justify-content:center; width:100%";
  let input = document.createElement("input");
  input.style.cssText = "width:85%;border:2px solid black";
  input.placeholder = "Reply discussion above";
  let button = document.createElement("button");
  button.style.cssText =
    "float:right; text-align:center; background-color:gray; opacity:1 !important; margin-left:5px; padding:0 3px; border-radius:10px";
  button.id = `button-${e.target.id.slice(9)}`;
  button.innerHTML = "submit";
  let document_frag = document.createDocumentFragment();
  document_frag.appendChild(div);
  div.appendChild(input);
  div.appendChild(button);
  disc_container.appendChild(document_frag);
}
